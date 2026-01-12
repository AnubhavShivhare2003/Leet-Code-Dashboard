const API_BASE_URL = 'http://localhost:4000/api';

export const api = {
  // Users API
  getUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/users`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API getUsers error:', error);
      throw error;
    }
  },
  
  getUserById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/user/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API getUserById error for id ${id}:`, error);
      throw error;
    }
  },

  // LeetCode API
  getLeaderboard: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/leetcode/leaderboard`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API getLeaderboard error:', error);
      throw error;
    }
  },

  getLeetCodeStats: async (leetcodeProfileID) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leetcode/user/${leetcodeProfileID}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API getLeetCodeStats error for ${leetcodeProfileID}:`, error);
      throw error;
    }
  }
};
