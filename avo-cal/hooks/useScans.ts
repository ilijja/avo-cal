import { useQueryClient, useMutation } from '@tanstack/react-query';
import { ScanService } from '@/services';
import { useUserStore } from '@/store';
import { Scan, CreateScanData, UpdateScanData } from '@/services/database/scanService';
import { getDayBounds } from '@/services/utils';

export const DAILY_CALORIES_QUERY_KEY = ['daily-calories'];
export const DAILY_SCANS_QUERY_KEY = ['daily-scans'];

export function useScans() {
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  // Mutation za kreiranje novog scana
  const createScanMutation = useMutation({
    mutationFn: ScanService.createScan,
    onSuccess: () => {
      // Invalidate daily calories and daily scans queries
      queryClient.invalidateQueries({ queryKey: DAILY_CALORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DAILY_SCANS_QUERY_KEY });
    },
  });

  // Mutation za ažuriranje scana
  const updateScanMutation = useMutation({
    mutationFn: ({ scanId, updateData }: { scanId: string; updateData: UpdateScanData }) =>
      ScanService.updateScan(scanId, updateData),
    onSuccess: () => {
      // Invalidate daily calories and daily scans queries
      queryClient.invalidateQueries({ queryKey: DAILY_CALORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DAILY_SCANS_QUERY_KEY });
    },
  });

  // Mutation za brisanje scana
  const deleteScanMutation = useMutation({
    mutationFn: (scanId: string) => ScanService.deleteScan(scanId),
    onSuccess: () => {
      // Invalidate daily calories and daily scans queries
      queryClient.invalidateQueries({ queryKey: DAILY_CALORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DAILY_SCANS_QUERY_KEY });
    },
  });

  // Funkcija za dodavanje skeleton-a u cache
  const addSkeletonToCache = (imageUrl: string) => {
    const skeletonScan: Scan = {
      id: `skeleton-${Date.now()}`,
      user_id: user?.id || '',
      ingredients: { items: [] },
      total_calories: 0,
      image_url: imageUrl,
      created_at: new Date().toISOString(), // Use current date for today
    };

    // Add to daily scans cache for today
    const today = new Date();
    const { start, end } = getDayBounds(today);
    const dailyScansKey = [...DAILY_SCANS_QUERY_KEY, user?.id, start.toISOString(), end.toISOString()];
    
    queryClient.setQueryData(dailyScansKey, (oldData: Scan[] = []) => {
      return [skeletonScan, ...oldData];
    });
  };

  // Funkcija za uklanjanje skeleton-a
  const removeSkeletonFromCache = () => {
    // Remove from daily scans cache for today
    const today = new Date();
    const { start, end } = getDayBounds(today);
    const dailyScansKey = [...DAILY_SCANS_QUERY_KEY, user?.id, start.toISOString(), end.toISOString()];
    
    queryClient.setQueryData(dailyScansKey, (oldData: Scan[] = []) => {
      return oldData.filter(scan => {
        const scanId = String(scan?.id || '');
        return !scanId.startsWith('skeleton-');
      });
    });
  };

  // Funkcija za update skeleton-a sa real data
  const updateSkeletonWithRealData = (realScan: Scan) => {
    // Update daily scans cache for today
    const today = new Date();
    const { start, end } = getDayBounds(today);
    const dailyScansKey = [...DAILY_SCANS_QUERY_KEY, user?.id, start.toISOString(), end.toISOString()];
    
    queryClient.setQueryData(dailyScansKey, (oldData: Scan[] = []) => {
      return oldData.map(scan => {
        const scanId = String(scan?.id || '');
        if (scanId.startsWith('skeleton-')) {
          // Zameni skeleton sa real data
          return {
            ...realScan,
            id: realScan.id, // Osiguraj da ima pravi ID
          };
        }
        return scan;
      });
    });
  };

  const invalidateScans = () => {
    queryClient.invalidateQueries({ queryKey: DAILY_SCANS_QUERY_KEY });
  };

  return {
    createScan: createScanMutation.mutateAsync,
    isCreating: createScanMutation.isPending,
    updateScan: updateScanMutation.mutateAsync,
    isUpdating: updateScanMutation.isPending,
    deleteScan: deleteScanMutation.mutateAsync,
    isDeleting: deleteScanMutation.isPending,
    addSkeletonToCache,
    removeSkeletonFromCache,
    updateSkeletonWithRealData,
    invalidateScans,
  };
}

