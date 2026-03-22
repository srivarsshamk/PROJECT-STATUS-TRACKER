import axios from 'axios';
import { Program } from '@/types';

const API_BASE_URL = 'http://localhost:8080/api/programs';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const programApi = {
  // Get all programs
  getAllPrograms: async (): Promise<Program[]> => {
    try {
      const response = await apiClient.get('');
      return response.data;
    } catch (error) {
      console.error('Error fetching programs:', error);
      throw error;
    }
  },

  // Search programs
  searchPrograms: async (keyword: string): Promise<Program[]> => {
    try {
      if (!keyword.trim()) {
        return programApi.getAllPrograms();
      }
      const response = await apiClient.get('/search', {
        params: { keyword },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching programs:', error);
      throw error;
    }
  },

  // Add a new program
  addProgram: async (name: string): Promise<Program> => {
    try {
      const response = await apiClient.post('', {
        name,
      });
      return response.data;
    } catch (error) {
      console.error('Error adding program:', error);
      throw error;
    }
  },
};
