import axios from 'axios';
import { Team } from '@/types';

const API_BASE_URL = 'http://localhost:8080/api/teams';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const teamApi = {
  // Get all teams
  getTeams: async (): Promise<Team[]> => {
    try {
      const response = await apiClient.get('');
      return response.data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },

  // Search teams
  searchTeams: async (keyword: string): Promise<Team[]> => {
    try {
      if (!keyword.trim()) {
        return teamApi.getTeams();
      }
      const response = await apiClient.get('/search', {
        params: { keyword },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching teams:', error);
      throw error;
    }
  },

  // Add a new team
  addTeam: async (name: string): Promise<Team> => {
    try {
      const response = await apiClient.post('', {
        name,
      });
      return response.data;
    } catch (error) {
      console.error('Error adding team:', error);
      throw error;
    }
  },
};
