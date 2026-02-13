'use client'

import { useEffect, useState } from 'react'
import type { TgdsDetail } from '@/types/tgds'

export function useTgds(sessionId: string) {
  const [tgds, setTgds] = useState<TgdsDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchTgds = async () => {
      try {
        const res = await fetch(`/api/dashboard/tgds/${sessionId}`, {
          cache: 'no-store',
        })

        if (!res.ok) throw new Error()

        const data: TgdsDetail = await res.json()
        console.log(data)
        setTgds(data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchTgds()
  }, [sessionId])

  return { tgds, loading, error }
}