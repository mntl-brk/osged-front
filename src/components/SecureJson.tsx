'use client'

import { useEffect, useState } from 'react'

interface SecureJsonProps {
  path: string | null
}

export function SecureJson({ path }: SecureJsonProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!path) return

    const fetchJson = async () => {
      try {
        const res = await fetch(`/api/media/${path}`, {
          cache: 'no-store',
        })

        if (!res.ok) {
          throw new Error('Failed')
        }

        const json = await res.json()
        setData(json)
      } catch (e) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchJson()
  }, [path])

  if (!path)
    return (
      <div className="h-56 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-300">
        ไม่มี JSON
      </div>
    )

  if (loading)
    return (
      <div className="h-56 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-400">
        Loading...
      </div>
    )

  if (error)
    return (
      <div className="h-56 flex items-center justify-center bg-red-50 rounded-2xl text-red-400">
        ไม่สามารถโหลด JSON ได้
      </div>
    )

    return (
        <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">


            {/* Scroll Area */}
            <div className="p-4 h-56 overflow-y-auto">
            <pre
                className="
                text-sm
                text-blue-900
                font-mono
                leading-relaxed
                whitespace-pre-wrap
                break-words
                "
            >
                {JSON.stringify(data, null, 2)}
            </pre>
            </div>
        </div>



  )
}