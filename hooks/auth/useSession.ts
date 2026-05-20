import { useSessionContext } from '@/contexts/session';

/**
 * Acceso a la sesión actual.
 * Fase 3: status siempre 'local', profile viene de SQLite local.
 * Fase 4: status refleja auth real; profile puede ser null cuando no autenticado.
 */
export function useSession() {
  return useSessionContext();
}
