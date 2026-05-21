import { useEffect } from 'react';
import { useRouter } from 'expo-router';

// Deep-link target is learnhub://reset-password (root route).
// This auth-prefixed route redirects there in case of stale links.
export default function AuthResetPasswordRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/reset-password' as never); }, []);
  return null;
}
