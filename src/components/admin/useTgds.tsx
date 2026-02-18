import { useQuery } from '@tanstack/react-query'
import type { TgdsDetail } from '@/types/tgds'

export function useTgds(sessionId: string) {
  return useQuery({
    queryKey: ['tgds', sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/tgds/${sessionId}`)
      if (!res.ok) throw new Error()
      return res.json() as Promise<TgdsDetail>
    },
    staleTime: 1000 * 60 * 5, 
  })
}