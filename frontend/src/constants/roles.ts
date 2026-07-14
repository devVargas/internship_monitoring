import type { CurrentUser } from '../api/auth.ts'

export const GROUP_TEACHER = 'Teacher'
export const GROUP_COORDINATOR = 'Coordinator'

export const ACADEMIC_GROUPS = [GROUP_TEACHER, GROUP_COORDINATOR] as const

export function canAccessAcademicArea(
  user: Pick<CurrentUser, 'groups' | 'is_superuser'>,
): boolean {
  return (
    user.is_superuser ||
    user.groups.some((group) => ACADEMIC_GROUPS.includes(group as (typeof ACADEMIC_GROUPS)[number]))
  )
}
