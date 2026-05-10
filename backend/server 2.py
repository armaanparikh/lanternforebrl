#!/usr/bin/env python3
"""
LANTERN Backend Server
Language Analysis of Text Retell Networks

Provides endpoints for:
- Local Whisper transcription (NO OpenAI API - fully local)
- Co-occurrence matrix generation

This server uses the local Whisper model for transcription,
ensuring all processing happens on your machine without any
API calls to external services.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import pandas as pd
import numpy as np
import os
import re
import tempfile
from pathlib import Path
from collections import defaultdict, Counter
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'm4a', 'flac', 'ogg', 'wma', 'aac', 'mp4', 'mov', 'avi', 'mkv'}
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Load Whisper model on startup
print("Loading Whisper model...")
whisper_model = None
current_model_name = None

def get_model(model_name='turbo'):
    """Load or return cached Whisper model"""
    global whisper_model, current_model_name

    if whisper_model is None or current_model_name != model_name:
        print(f"Loading Whisper model: {model_name}...")
        whisper_model = whisper.load_model(model_name)
        current_model_name = model_name
        print(f"Model {model_name} loaded successfully")

    return whisper_model

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_text_for_cooccurrence(text):
    """Preprocess text and extract words for co-occurrence analysis"""
    text = re.sub(r'\s+', ' ', text.strip().lower())
    # Keep contractions as single words (they're, don't, won't, etc.)
    words = re.findall(r"\b[a-z]+(?:'[a-z]+)?\b", text)
    return words

def create_cooccurrence_matrix(words, window_size, min_freq=1):
    """Create co-occurrence matrix from words list"""
    word_counts = Counter(words)
    vocabulary = [word for word, count in word_counts.items() if count >= min_freq]
    vocab_set = set(vocabulary)

    cooccurrence_dict = defaultdict(float)

    for i in range(len(words)):
        if words[i] in vocab_set:
            for distance in range(1, window_size + 1):
                if i + distance < len(words) and words[i + distance] in vocab_set:
                    pair = tuple(sorted([words[i], words[i + distance]]))
                    weight = 1.0 / distance
                    cooccurrence_dict[pair] += weight

    vocab_size = len(vocabulary)
    matrix = np.zeros((vocab_size, vocab_size), dtype=float)
    word_to_idx = {word: idx for idx, word in enumerate(vocabulary)}

    for (word1, word2), value in cooccurrence_dict.items():
        idx1, idx2 = word_to_idx[word1], word_to_idx[word2]
        matrix[idx1, idx2] = value
        matrix[idx2, idx1] = value

    cooccurrence_df = pd.DataFrame(matrix, index=vocabulary, columns=vocabulary)

    return cooccurrence_df, vocabulary

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'LANTERN Backend is running'}), 200

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """
    Transcribe audio file using local Whisper model

    Expected form data:
    - file: audio file
    - model: (optional) whisper model name (default: turbo)
    - language: (optional) language code (default: en)
    """
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Supported: ' + ', '.join(ALLOWED_EXTENSIONS)}), 400

        # Get optional parameters
        model_name = request.form.get('model', 'turbo')
        language = request.form.get('language', 'en')

        # Save uploaded file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            # Load model
            model = get_model(model_name)

            # Transcribe
            print(f"Transcribing {filename}...")
            result = model.transcribe(filepath, language=language, verbose=False)
            text = result["text"]

            # Clean up temp file
            os.remove(filepath)

            return jsonify({
                'success': True,
                'transcription': text,
                'model': model_name,
                'language': language
            }), 200

        except Exception as e:
            # Clean up temp file on error
            if os.path.exists(filepath):
                os.remove(filepath)
            raise e

    except Exception as e:
        print(f"Transcription error: {str(e)}")
        return jsonify({'error': f'Transcription failed: {str(e)}'}), 500

@app.route('/cooccurrence', methods=['POST'])
def generate_cooccurrence():
    """
    Generate co-occurrence matrix from text

    Expected JSON data:
    - text: transcription text
    - window_size: (optional) co-occurrence window size (default: 2)
    - min_freq: (optional) minimum word frequency (default: 1)
    """
    try:
        data = request.get_json()

        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400

        text = data['text']
        window_size = data.get('window_size', 2)
        min_freq = data.get('min_freq', 1)

        # Validate parameters
        if not isinstance(window_size, int) or window_size < 1:
            return jsonify({'error': 'window_size must be a positive integer'}), 400

        if not isinstance(min_freq, int) or min_freq < 1:
            return jsonify({'error': 'min_freq must be a positive integer'}), 400

        # Preprocess text
        words = preprocess_text_for_cooccurrence(text)

        if len(words) == 0:
            return jsonify({'error': 'No valid words found in text'}), 400

        # Generate co-occurrence matrix
        cooccurrence_df, vocabulary = create_cooccurrence_matrix(words, window_size, min_freq)

        # Convert to format suitable for frontend
        # Return as list of {word1, word2, value} for easier visualization
        cooccurrence_pairs = []
        for i, word1 in enumerate(vocabulary):
            for j, word2 in enumerate(vocabulary):
                if i <= j:  # Only upper triangle to avoid duplicates
                    value = cooccurrence_df.iloc[i, j]
                    if value > 0:
                        cooccurrence_pairs.append({
                            'word1': word1,
                            'word2': word2,
                            'value': float(value)
                        })

        # Sort by value descending
        cooccurrence_pairs.sort(key=lambda x: x['value'], reverse=True)

        # Also return matrix format for heatmap visualization
        matrix_data = {
            'vocabulary': vocabulary,
            'matrix': cooccurrence_df.values.tolist(),
            'pairs': cooccurrence_pairs[:100],  # Top 100 pairs for display
            'total_words': len(words),
            'unique_words': len(vocabulary),
            'window_size': window_size
        }

        return jsonify({
            'success': True,
            'data': matrix_data
        }), 200

    except Exception as e:
        print(f"Co-occurrence generation error: {str(e)}")
        return jsonify({'error': f'Co-occurrence generation failed: {str(e)}'}), 500

@app.route('/models', methods=['GET'])
def list_models():
    """List available Whisper models"""
    models = ['tiny', 'base', 'small', 'medium', 'large', 'turbo']
    return jsonify({
        'models': models,
        'current': current_model_name,
        'recommended': 'turbo'
    }), 200

if __name__ == '__main__':
    print("=" * 70)
    print("🔦 LANTERN Backend Server")
    print("   Language Analysis of Text Retell Networks")
    print("=" * 70)
    print("⚙️  Configuration:")
    print(f"   - Upload folder: {UPLOAD_FOLDER}")
    print(f"   - Max file size: {MAX_FILE_SIZE / (1024*1024):.0f}MB")
    print(f"   - Transcription: LOCAL WHISPER ONLY (No OpenAI API)")
    print("   - Server: http://127.0.0.1:5000")
    print("=" * 70)

    # Start server
    app.run(host='127.0.0.1', port=5000, debug=True)
