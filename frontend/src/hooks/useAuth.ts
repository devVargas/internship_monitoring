import { useAPI } from '../context/APIProvider.tsx'

export function useAuth() {
  return useAPI().auth
}
