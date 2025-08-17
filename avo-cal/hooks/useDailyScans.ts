import { useQuery } from '@tanstack/react-query';
import { ScanService } from '@/services';
import { useUserStore } from '@/store';
import { getDayBounds } from '@/services/utils';

export const DAILY_SCANS_QUERY_KEY = ['daily-scans'];

export function useDailyScans(selectedDate: Date) {
  const { user } = useUserStore();
  
  const { start, end } = getDayBounds(selectedDate);
  
  return useQuery({
    queryKey: [...DAILY_SCANS_QUERY_KEY, user?.id, start.toISOString(), end.toISOString()],
    queryFn: () => ScanService.getScansForDateRange(start, end),
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
