'use client'

import React, { useEffect, useState } from 'react'
import {
  ArrowLeft,
  UserPlus,
  Copy,
  Check,
  Search,
  ClipboardList,
  Calendar,
  Ban,
  Power
} from 'lucide-react'

import { listParticipants } from '@/api/participant/listParticipants'
import { createParticipant } from '@/api/participant/createParticipant'
import { updateParticipantStatus } from '@/api/participant/updateParticipantStatus'
import { Participant } from '@/types/Participant'

interface VolunteerManagementPageProps {
  onBack: () => void
}

type FilterType = 'all' | 'unused' | 'used' | 'disabled'

export const VolunteerManagementPage: React.FC<
  VolunteerManagementPageProps
> = ({ onBack }) => {
  const [codes, setCodes] = useState<Participant[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

  const [actionTarget, setActionTarget] = useState<Participant | null>(null)
  const [actionType, setActionType] = useState<'disable' | 'enable' | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const openDisableModal = (participant: Participant) => {
    setActionTarget(participant)
    setActionType('disable')
  }

  const openEnableModal = (participant: Participant) => {
    setActionTarget(participant)
    setActionType('enable')
  }
  // =========================
  // LOAD
  // =========================

  useEffect(() => {
    const load = async () => {
      const result = await listParticipants()

      result.match(
        (data) => {
          const mapped = data
            .map((p) => ({
              id: p.id,
              code: p.code,
              status: p.status,
              created_at: p.created_at,
              within_two_months: p.within_two_months
            }))
            .sort(
              (a, b) =>
                new Date(b.created_at!).getTime() -
                new Date(a.created_at!).getTime()
            )

          setCodes(mapped)
        },
        () => alert('โหลดข้อมูลไม่สำเร็จ')
      )
    }

    load()
  }, [])

  // =========================
  // CREATE
  // =========================

  const generateCode = async () => {
    const result = await createParticipant()

    result.match(
      (p) => {
        const newCode: Participant = {
          id: p.id,
          code: p.code,
          status: p.status,
          created_at: p.created_at,
          within_two_months: p.within_two_months
        }

        setCodes((prev) => [newCode, ...prev])
      },
      () => alert('สร้างรหัสไม่สำเร็จ')
    )
  }

  // =========================
  // COPY
  // =========================

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)

    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // =========================
  // DISABLE
  // =========================

  const disableCode = async (id: string) => {
    if (!confirm('ต้องการปิดการใช้งานรหัสนี้หรือไม่?')) return

    const result = await updateParticipantStatus({
      id,
      status: 'deleted'
    })

    result.match(
      () => {
        setCodes((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, status: 'deleted' } : c
          )
        )
      },
      () => alert('ไม่สามารถปิดใช้งานได้')
    )
  }

  // =========================
  // ENABLE
  // =========================

  const enableCode = async (id: string) => {
    const result = await updateParticipantStatus({
      id,
      status: 'unused'
    })

    result.match(
      () => {
        setCodes((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, status: 'unused' } : c
          )
        )
      },
      () => alert('ไม่สามารถเปิดใช้งานได้')
    )
  }

  // =========================
  // FILTER
  // =========================

  const filteredCodes = codes
    .filter((c) => filter === 'all' || c.status === filter)
    .filter((c) =>
      c.code.toLowerCase().includes(search.toLowerCase())
    )

  // =========================
  // STATUS STYLE
  // =========================

  const STATUS_STYLE = {
    unused: 'bg-green-100 text-green-700 border-green-200',
    used: 'bg-blue-100 text-blue-700 border-blue-200',
    deleted: 'bg-red-100 text-red-600 border-red-200'
  }

  const STATUS_LABEL = {
    unused: 'พร้อมใช้งาน',
    used: 'ใช้งานแล้ว',
    deleted: 'ปิดใช้งาน'
  }

  // =========================
  // SUMMARY
  // =========================

  const handleConfirmAction = async () => {
    if (!actionTarget || !actionType) return

    setIsUpdating(true)

    const status = actionType === 'disable' ? 'deleted' : 'unused'

    const result = await updateParticipantStatus({
      id: actionTarget.id,
      status
    })

    result.match(
      () => {
        setCodes(prev =>
          prev.map(c =>
            c.id === actionTarget.id
              ? { ...c, status }
              : c
          )
        )

        setActionTarget(null)
        setActionType(null)
      },
      () => alert('ไม่สามารถอัปเดตสถานะได้')
    )

    setIsUpdating(false)
  }

  const unusedCount = codes.filter((c) => c.status === 'unused').length
  const usedCount = codes.filter((c) => c.status === 'used').length
  const disabledCount = codes.filter((c) => c.status === 'deleted').length

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}

      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">

        <button
          onClick={onBack}
          className="p-3 rounded-xl hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft size={22} />
        </button>

        <div>
          <h1 className="text-xl font-extrabold text-gray-900">
            จัดการรหัสอาสาสมัคร
          </h1>

          <p className="text-xs text-gray-400 font-semibold tracking-widest uppercase">
            Volunteer Access Keys
          </p>
        </div>

      </header>

      <main className="flex-grow p-4 md:p-8 max-w-350 mx-auto w-full">

        {/* SUMMARY */}

        <div className="grid grid-cols-4 gap-5 mb-8">

          <SummaryCard
            label="ทั้งหมด"
            value={codes.length}
            color="gray"
          />

          <SummaryCard
            label="พร้อมใช้"
            value={unusedCount}
            color="green"
          />

          <SummaryCard
            label="ใช้แล้ว"
            value={usedCount}
            color="blue"
          />

          <SummaryCard
            label="ปิดใช้งาน"
            value={disabledCount}
            color="red"
          />

        </div>

        {/* FILTER */}

        <div className="flex gap-2 mb-4">

          {[
            { key: 'all', label: 'ทั้งหมด' },
            { key: 'unused', label: 'พร้อมใช้' },
            { key: 'used', label: 'ใช้แล้ว' },
            { key: 'deleted', label: 'ปิดใช้งาน' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as FilterType)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition
              ${
                filter === tab.key
                  ? 'bg-primary text-white shadow'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}

        </div>

        {/* SEARCH + CREATE */}

        <div className="flex items-center gap-3 mb-6">

          <div className="flex items-center gap-2 flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/30">

            <Search size={18} className="text-gray-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหารหัส..."
              className="outline-none w-full text-gray-700 placeholder:text-gray-400"
            />

          </div>

          <button
            onClick={generateCode}
            className="bg-primary hover:bg-primaryHover text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-sm hover:shadow transition"
          >
            <UserPlus size={18} />
            สร้างรหัส
          </button>

        </div>

        {/* LIST */}

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2 bg-gray-50">

            <ClipboardList size={18} className="text-gray-500" />

            <h3 className="font-semibold text-gray-700">
              รายการรหัส
            </h3>

          </div>

          {filteredCodes.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              ไม่พบข้อมูล
            </div>
          ) : (
            filteredCodes.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-6 py-5 border-b last:border-none hover:bg-gray-50 transition"
              >

                <div className="flex items-center gap-4">

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLE[item.status]}`}
                  >
                    {STATUS_LABEL[item.status]}
                  </span>

                  <div>

                    <p className="text-xl font-mono font-bold tracking-wider text-gray-900">
                      {item.code}
                    </p>

                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <Calendar size={12} />
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString('th-TH')
                        : 'N/A'}
                    </p>

                  </div>

                </div>

                <div className="flex gap-2">

                <button
                  onClick={() => copyToClipboard(item.code, item.id)}
                  className={`p-2.5 rounded-lg border transition flex items-center justify-center
                  ${
                    copiedId === item.id
                      ? 'bg-green-100 border-green-200 text-green-600'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {copiedId === item.id ? (
                    <Check size={18} />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
                  {item.status === 'unused' && (
                    <button
                      onClick={() => openDisableModal(item)}
                      className="p-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Ban size={18} />
                    </button>
                  )}

                  {item.status === 'deleted' && (
                    <button
                      onClick={() => openEnableModal(item)}
                      className="p-2.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50"
                    >
                      <Power size={18} />
                    </button>
                  )}

                </div>

              </div>
            ))
          )}

        </div>

      </main>

      {actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isUpdating && setActionTarget(null)}
          />

          {/* modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md animate-fade-in">

            <h2 className="text-2xl font-black text-gray-900 mb-3">

              {actionType === 'disable'
                ? 'ปิดการใช้งานรหัส'
                : 'เปิดใช้งานรหัส'}

            </h2>

            <p className="text-gray-600 mb-6">

              {actionType === 'disable'
                ? 'ต้องการปิดการใช้งานรหัสนี้หรือไม่?'
                : 'ต้องการเปิดใช้งานรหัสนี้อีกครั้งหรือไม่?'}

            </p>

            <div className="bg-gray-50 border rounded-xl px-4 py-3 mb-6">

              <p className="font-mono font-bold text-lg text-gray-800">
                {actionTarget.code}
              </p>

            </div>

            <div className="flex justify-end gap-3">

              <button
                disabled={isUpdating}
                onClick={() => setActionTarget(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50"
              >
                ยกเลิก
              </button>

              <button
                disabled={isUpdating}
                onClick={handleConfirmAction}
                className={`px-5 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2
                ${
                  actionType === 'disable'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >

                {isUpdating && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}

                {actionType === 'disable'
                  ? 'ปิดการใช้งาน'
                  : 'เปิดใช้งาน'}

              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  color
}: {
  label: string
  value: number
  color: 'gray' | 'green' | 'blue' | 'red'
}) {

  const styles = {
    gray: 'bg-white border-gray-200 text-gray-900',
    green: 'bg-green-50 border-green-200 text-green-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    red: 'bg-red-50 border-red-200 text-red-600'
  }

  return (
    <div
      className={`rounded-xl border px-5 py-4 shadow-sm hover:shadow transition ${styles[color]}`}
    >
      <p className="text-xs font-bold uppercase tracking-wider opacity-70">
        {label}
      </p>

      <p className="text-3xl font-black mt-1">{value}</p>
    </div>
  )
}