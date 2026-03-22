import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/updates';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface UpdateResponse {
  id: number;
  status: string;
  programName: string;
  teamName: string;
  description: string;
  updatedBy: string;
  date: string;
}

export interface UpdatePayload {
  status: string;
  programName: string;
  teamName: string;
  description: string;
  updatedBy: string;
  date: string;
}

export const updateApi = {
  // Get all updates
  getUpdates: async (): Promise<UpdateResponse[]> => {
    try {
      const response = await apiClient.get('');
      return response.data;
    } catch (error) {
      console.error('Error fetching updates:', error);
      throw error;
    }
  },

  // Filter updates
  filterUpdates: async (params: {
    status?: string;
    programName?: string;
    teamName?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<UpdateResponse[]> => {
    try {
      // Build query params, only including non-empty values
      const queryParams = new URLSearchParams();
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params.programName && params.programName !== 'all') queryParams.append('program', params.programName);
      if (params.teamName && params.teamName !== 'all') queryParams.append('team', params.teamName);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await apiClient.get(`/filter?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error filtering updates:', error);
      throw error;
    }
  },

  // Add a new update
  addUpdate: async (data: UpdatePayload): Promise<UpdateResponse> => {
    try {
      const response = await apiClient.post('', data);
      return response.data;
    } catch (error) {
      console.error('Error adding update:', error);
      throw error;
    }
  },
};
