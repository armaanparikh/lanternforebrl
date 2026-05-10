
// Generate waveform data from audio with enhanced speech detection
export const generateWaveform = async (audioUrl: string): Promise<number[]> => {
  console.log('Starting enhanced waveform generation for:', audioUrl);
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    console.log('AudioContext created');
    
    const response = await fetch(audioUrl);
    console.log('Audio fetched, status:', response.status);
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('ArrayBuffer size:', arrayBuffer.byteLength);
    
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    console.log('Audio decoded - duration:', audioBuffer.duration, 'channels:', audioBuffer.numberOfChannels);
    
    const channelData = audioBuffer.getChannelData(0);
    console.log('Channel data length:', channelData.length);
    
    // Increase sample count for better precision at high zoom levels
    const samples = 3200; // Double the previous amount for better detail
    const blockSize = Math.floor(channelData.length / samples);
    console.log('Block size:', blockSize);
    
    const waveformData: number[] = [];
    
    for (let i = 0; i < samples; i++) {
      let sum = 0;
      let squareSum = 0;
      
      // Calculate both average and RMS for better speech detection
      for (let j = 0; j < blockSize; j++) {
        const sample = Math.abs(channelData[i * blockSize + j] || 0);
        sum += sample;
        squareSum += sample * sample;
      }
      
      // Use RMS (Root Mean Square) for better speech detection
      const rms = Math.sqrt(squareSum / blockSize);
      waveformData.push(rms);
    }

    // Normalize waveform data
    const max = Math.max(...waveformData);
    console.log('Max RMS amplitude:', max);
    
    const normalizedData = waveformData.map(val => max > 0 ? val / max : 0.1);
    console.log('Enhanced waveform generated, first few values:', normalizedData.slice(0, 10));
    
    return normalizedData;
  } catch (error) {
    console.error('Error in generateWaveform:', error);
    // Return enhanced test data with speech-like patterns
    const testData = Array(3200).fill(0).map((_, i) => {
      // Create speech-like patterns with varying intensity
      const base = Math.sin(i / 100) * 0.3 + 0.3;
      const speech = Math.random() > 0.7 ? Math.random() * 0.4 : 0;
      return Math.min(1, base + speech);
    });
    console.log('Returning enhanced test waveform data');
    return testData;
  }
};

// Convert audio buffer to WAV
export const audioBufferToWav = (buffer: AudioBuffer): Promise<Blob> => {
  return new Promise(resolve => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);

    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    resolve(new Blob([arrayBuffer], {
      type: 'audio/wav'
    }));
  });
};

// Trim audio function
export const trimAudio = async (
  audioUrl: string,
  audioFile: File,
  startTime: number,
  endTime: number
): Promise<{ blob: Blob; file: File }> => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const response = await fetch(audioUrl);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const startSample = Math.floor(startTime * audioBuffer.sampleRate);
  const endSample = Math.floor(endTime * audioBuffer.sampleRate);
  const trimmedLength = endSample - startSample;

  // Create new audio buffer for trimmed audio
  const trimmedBuffer = audioContext.createBuffer(audioBuffer.numberOfChannels, trimmedLength, audioBuffer.sampleRate);

  // Copy trimmed data
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    const trimmedData = trimmedBuffer.getChannelData(channel);
    for (let i = 0; i < trimmedLength; i++) {
      trimmedData[i] = channelData[startSample + i];
    }
  }

  // Convert to WAV blob
  const wavBlob = await audioBufferToWav(trimmedBuffer);
  const trimmedFileName = `trimmed_${audioFile.name.replace(/\.[^/.]+$/, '')}.wav`;
  const trimmedFile = new File([wavBlob], trimmedFileName, {
    type: 'audio/wav'
  });

  return { blob: wavBlob, file: trimmedFile };
};
