import { TranscriptionProject, TranscriptionVersion } from '@/types/audioTranscription';

const STORAGE_KEY = 'transcription_projects';

export const saveProjects = (projects: TranscriptionProject[]) => {
  try {
    // Convert to serializable format (remove File objects)
    const serializable = projects.map(project => ({
      ...project,
      audioFile: {
        ...project.audioFile,
        file: null, // Don't store the actual File object
      }
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (error) {
    console.error('Failed to save projects:', error);
  }
};

export const loadProjects = (): TranscriptionProject[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const projects = JSON.parse(stored);
    return projects.map((project: any) => ({
      ...project,
      createdAt: new Date(project.createdAt),
      updatedAt: new Date(project.updatedAt),
      versions: project.versions.map((version: any) => ({
        ...version,
        createdAt: new Date(version.createdAt),
        updatedAt: new Date(version.updatedAt),
      }))
    }));
  } catch (error) {
    console.error('Failed to load projects:', error);
    return [];
  }
};

export const saveProject = (project: TranscriptionProject) => {
  const projects = loadProjects();
  const existingIndex = projects.findIndex(p => p.id === project.id);
  
  if (existingIndex >= 0) {
    projects[existingIndex] = project;
  } else {
    projects.push(project);
  }
  
  saveProjects(projects);
};

export const getAllTranscriptionVersions = (): Array<{
  project: TranscriptionProject;
  version: TranscriptionVersion;
}> => {
  const projects = loadProjects();
  const versions: Array<{ project: TranscriptionProject; version: TranscriptionVersion }> = [];
  
  projects.forEach(project => {
    project.versions.forEach(version => {
      versions.push({ project, version });
    });
  });
  
  return versions.sort((a, b) => 
    new Date(b.version.updatedAt).getTime() - new Date(a.version.updatedAt).getTime()
  );
};

export const getTranscriptionVersionsByType = (type: 'whisper_raw' | 'whisper_qa' | 'manual') => {
  return getAllTranscriptionVersions().filter(({ version }) => version.type === type);
};

export const deleteProject = (projectId: string) => {
  const projects = loadProjects();
  const filtered = projects.filter(p => p.id !== projectId);
  saveProjects(filtered);
};

export const exportTranscriptionVersion = (version: TranscriptionVersion, projectName: string) => {
  const blob = new Blob([version.content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}_${version.name}_${version.updatedAt.toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}; 