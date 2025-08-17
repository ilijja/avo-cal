import { useQuery } from '@tanstack/react-query';
import { UserProfileService } from '@/services';
import { useUserStore } from '@/store';

export const USER_PROFILE_QUERY_KEY = ['user-profile'];

export function useUserProfile() {
  const { user } = useUserStore();

  const query = useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: () => UserProfileService.ensureUserProfile(),
    enabled: !!user,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
