const API_BASE = 'http://localhost:3001/api';

export interface DataSource {
  id: string;
  name: string;
  type: 'excel' | 'pdf' | 'image' | 'video';
  uploadedAt: string;
  size: number;
  status: 'processing' | 'ready' | 'error';
}

export interface Segment {
  id: string;
  name: string;
  description: string;
  traits: {
    demographics: Record<string, string>;
    psychographics: Record<string, string>;
    behaviors: Record<string, string>;
  };
  personaCount: number;
  createdAt: string;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'likert' | 'open_ended' | 'ranking';
  text: string;
  options?: string[];
  scale?: { min: number; max: number; labels?: { min: string; max: string } };
  required: boolean;
}

export interface Survey {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Simulation {
  id: string;
  surveyId: string;
  segmentIds: string[];
  sampleSize: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
}

export interface Response {
  id: string;
  simulationId: string;
  personaId: string;
  segmentId: string;
  answers: Record<string, any>;
  confidence: number;
  timestamp: string;
}

export interface SimulationResult {
  simulation: Simulation;
  responses: Response[];
  summary: {
    totalResponses: number;
    avgConfidence: number;
    questionStats: Record<string, any>;
  };
}

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Data Sources
  async getDataSources(): Promise<DataSource[]> {
    return this.request('/data-sources');
  }

  async uploadDataSource(file: File): Promise<DataSource> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE}/data-sources/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async deleteDataSource(id: string): Promise<void> {
    await this.request(`/data-sources/${id}`, { method: 'DELETE' });
  }

  // Segments
  async getSegments(): Promise<Segment[]> {
    return this.request('/segments');
  }

  async createSegment(segment: Omit<Segment, 'id' | 'createdAt' | 'personaCount'>): Promise<Segment> {
    return this.request('/segments', {
      method: 'POST',
      body: JSON.stringify(segment),
    });
  }

  async updateSegment(id: string, segment: Partial<Segment>): Promise<Segment> {
    return this.request(`/segments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(segment),
    });
  }

  async deleteSegment(id: string): Promise<void> {
    await this.request(`/segments/${id}`, { method: 'DELETE' });
  }

  // Surveys
  async getSurveys(): Promise<Survey[]> {
    return this.request('/surveys');
  }

  async getSurvey(id: string): Promise<Survey> {
    return this.request(`/surveys/${id}`);
  }

  async createSurvey(survey: Omit<Survey, 'id' | 'createdAt' | 'updatedAt'>): Promise<Survey> {
    return this.request('/surveys', {
      method: 'POST',
      body: JSON.stringify(survey),
    });
  }

  async updateSurvey(id: string, survey: Partial<Survey>): Promise<Survey> {
    return this.request(`/surveys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(survey),
    });
  }

  async deleteSurvey(id: string): Promise<void> {
    await this.request(`/surveys/${id}`, { method: 'DELETE' });
  }

  // Simulations
  async getSimulations(): Promise<Simulation[]> {
    return this.request('/simulations');
  }

  async getSimulation(id: string): Promise<Simulation> {
    return this.request(`/simulations/${id}`);
  }

  async createSimulation(data: {
    surveyId: string;
    segmentIds: string[];
    sampleSize: number;
  }): Promise<Simulation> {
    return this.request('/simulations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async runSimulation(id: string): Promise<Simulation> {
    return this.request(`/simulations/${id}/run`, {
      method: 'POST',
    });
  }

  // Results
  async getSimulationResults(id: string): Promise<SimulationResult> {
    return this.request(`/simulations/${id}/results`);
  }

  async downloadResultsCsv(id: string): Promise<Blob> {
    const response = await fetch(`${API_BASE}/simulations/${id}/results/csv`);
    if (!response.ok) {
      throw new Error(`Download Error: ${response.statusText}`);
    }
    return response.blob();
  }
}

export const api = new ApiClient();
