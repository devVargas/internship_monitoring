import { useAPI } from '../context/api-context.ts'

export function useAuth() {
  return useAPI().auth
}
