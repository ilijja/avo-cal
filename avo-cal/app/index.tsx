import { Redirect } from 'expo-router';
import { useUserStore } from '@/store';

export default function Index() {
  const { isLoading, isAuthenticated } = useUserStore();

  // Logika:
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/(onboarding)/welcome" />;
  return <Redirect href="/(main)/home" />;
}
