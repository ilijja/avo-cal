import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store';

export const DAILY_CALORIES_QUERY_KEY = ['daily-calories'];

export function useDailyCalories(selectedDate?: string) {
  const { user } = useUserStore();
  
  // Ako nije prosleđen datum, koristi današnji
  const date = selectedDate || new Date().toISOString().split('T')[0];

  const query = useQuery({
    queryKey: [...DAILY_CALORIES_QUERY_KEY, user?.id, date],
    queryFn: async () => {
      if (!user) return 0;

      // Dohvati sve scans za taj dan
      const { data: scans } = await supabase
        .from('scans')
        .select('total_calories')
        .eq('user_id', user.id)
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`);

      // Sumiraj sve kalorije
      return scans?.reduce((sum, scan) => sum + scan.total_calories, 0) || 0;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minuta
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
