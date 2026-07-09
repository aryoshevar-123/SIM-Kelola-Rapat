import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchAuthUser = async () => {
  try {
    const response = await axios.get('/api/auth/me');
    return response.data; 
  } catch (error) {
    console.error('Gagal mengambil data user:', error);
    return null;
  }
};

export default function useAuthUser() {
  return useQuery({
    queryKey: ['authUser'],
    queryFn: fetchAuthUser,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}