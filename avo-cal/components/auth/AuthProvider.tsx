import { useEffect } from 'react';
import { useUserStore } from '@/store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { getCurrentUser } = useUserStore();

  useEffect(() => {
    // Check for existing session on app start
    getCurrentUser();
  }, []);

  return <>{children}</>;
}
