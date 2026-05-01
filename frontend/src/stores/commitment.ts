import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export interface Commitment {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: 'pending' | 'completed';
  completed_at?: number;
  created_at: number;
  updated_at: number;
  meeting_id?: string;
}

export const useCommitmentStore = defineStore('commitments', () => {
  const commitments = ref<Commitment[]>([]);
  const loading = ref(false);
  const pagination = ref({ page: 1, limit: 20, total: 0 });

  const fetchCommitments = async (params?: { status?: string; category?: string; page?: number }) => {
    loading.value = true;
    try {
      const response = await axios.get('/api/commitments', { params });
      commitments.value = response.data.data;
      pagination.value = response.data.pagination;
    } catch (error) {
      console.error('Failed to fetch commitments:', error);
    } finally {
      loading.value = false;
    }
  };

  const fetchCommitment = async (id: string) => {
    try {
      const response = await axios.get(`/api/commitments/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error('Failed to fetch commitment');
    }
  };

  const createCommitment = async (data: Partial<Commitment>) => {
    const response = await axios.post('/api/commitments', data);
    await fetchCommitments();
    return response.data.data;
  };

  const updateCommitment = async (id: string, data: Partial<Commitment>) => {
    const response = await axios.put(`/api/commitments/${id}`, data);
    await fetchCommitments();
    return response.data.data;
  };

  const deleteCommitment = async (id: string) => {
    await axios.delete(`/api/commitments/${id}`);
    await fetchCommitments();
  };

  const checkin = async (id: string) => {
    await axios.post(`/api/commitments/${id}/checkin`);
    await fetchCommitments();
  };

  const cancelCheckin = async (id: string) => {
    await axios.delete(`/api/commitments/${id}/checkin`);
    await fetchCommitments();
  };

  return {
    commitments,
    loading,
    pagination,
    fetchCommitments,
    fetchCommitment,
    createCommitment,
    updateCommitment,
    deleteCommitment,
    checkin,
    cancelCheckin,
  };
});
