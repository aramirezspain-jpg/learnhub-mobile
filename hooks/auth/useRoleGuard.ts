import { type UserRole } from '@/types/user';
import { useSessionContext } from '@/contexts/session';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  member: 1,
  leader: 2,
  admin:  3,
};

export type AuthFeature =
  | 'courses'
  | 'community'
  | 'prayer_requests'
  | 'contact_leadership'
  | 'service_request'
  | 'community_extended'
  | 'admin_panel';

const FEATURE_ROLE_MAP: Record<AuthFeature, UserRole> = {
  courses:              'member',
  community:            'member',
  prayer_requests:      'member',
  contact_leadership:   'member',
  service_request:      'member',
  community_extended:   'leader',
  admin_panel:          'admin',
};

export function hasRole(userRole: UserRole, required: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[required];
}

export function canAccess(feature: AuthFeature, userRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[FEATURE_ROLE_MAP[feature]];
}

export function useRoleGuard() {
  const { role } = useSessionContext();
  return {
    role,
    hasRole:   (required: UserRole)  => hasRole(role, required),
    canAccess: (feature: AuthFeature) => canAccess(feature, role),
  } as const;
}
