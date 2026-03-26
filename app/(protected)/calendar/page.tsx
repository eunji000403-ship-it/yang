'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Exhibition = {
  id: string
  title: string
  platform: string
  status: string
  start_date: string
  end_date: string
  owner?: string | null
  participation_status?: string | null
  discount?: string | null
  memo?: string | null
}

type CalendarEvent = {
  id: string
  title: string
  start: string
  end?: string
  allDay?: boolean
  extendedProps: {
    platform: string
    status: string
    exhibition: Exhibition
  }
}

function mapExhibitionToCalendarEvent(item: Exhibition): CalendarEvent {
  return {
    id: item.id,
    title: `[${item.platform}] ${item.title} (${item.status})`,
    start: item.start_date,
    end: item.end_date,
    allDay: true,
    extendedProps: {
      platform: item.platform,
      status: item.status,
      exhibition: item,
    },
  }
}

function statusHighlightClass(status: string) {
  switch (status) {
    case '진행중':
      return 'highlight-green'
    case '예정':
      return 'highlight-blue'
    case '준비중':
      return 'highlight-purple'
    case '종료':
      return 'highlight-gray'
    case '신청 완료':
      return 'highlight-sky'
    default:
      return 'highlight-gray'
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case '진행중':
      return 'bg-black text-white'
    case '예정':
      return 'bg-[#f3f4f6] text-black'
    case '준비중':
      return 'bg-[#f5f5f5] text-[#374151]'
    case '종료':
      return 'bg-[#e5e7eb] text-[#6b7280]'
    case '신청 완료':
      return 'bg-[#eef2ff] text-[#4338ca]'
    default:
      return 'bg-[#f3f4f6] text-black'
  }
}

export default function CalendarPage() {
  const [items, setItems] = useState<Exhibition[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState('전체')
  const [selectedItem, setSelectedItem] = useState<Exhibition | null>(null)

  const loadExhibitions = async () => {
    const { data, error } = await supabase
      .from('exhibitions')
      .select('*')
      .order('start_date', { ascending: true })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setItems((data as Exhibition[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    loadExhibitions()
  }, [])

  const filteredEvents = useMemo(() => {
    const mapped = items.map(mapExhibitionToCalendarEvent)

    if (selectedPlatform === '전체') return mapped

    return mapped.filter(
      (item) => item.extendedProps.platform === selectedPlatform
    )
  }, [items, selectedPlatform])

  if (loading) {
    return <div className="p-8 text-sm text-[#8b95a1]">캘린더 불러오는 중...</div>
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap gap-2">
            {['전체', '29CM', '무신사', '자사몰', '지그재그', 'W컨셉'].map((item) => (
              <button
                key={item}
                onClick={() => setSelectedPlatform(item)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  selectedPlatform === item
                    ? 'bg-black text-white'
                    : 'bg-[#f5f5f5] text-[#6b7280]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            height="auto"
            locale="ko"
            editable={false}
            selectable={false}
            dayMaxEventRows={3}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: '',
            }}
            events={filteredEvents}
            eventClick={(info) => {
              const exhibition = info.event.extendedProps.exhibition as Exhibition
              setSelectedItem(exhibition)
            }}
            eventContent={(arg) => {
              const status = arg.event.extendedProps.status as string

              return (
                <div className={`highlight-event-card ${statusHighlightClass(status)}`}>
                  <span className="highlight-event-title">{arg.event.title}</span>
                </div>
              )
            }}
          />
        </div>
      </div>

      {selectedItem && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/10"
            onClick={() => setSelectedItem(null)}
          />

          <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[420px] flex-col border-l border-[#e5e7eb] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#f0f1f3] px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#9ca3af]">
                  Exhibition Detail
                </p>
                <h2 className="mt-1 text-lg font-bold text-[#111111]">
                  기획전 정보
                </h2>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-lg border border-[#e5e7eb] p-2 text-[#6b7280] hover:bg-[#f9fafb]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="rounded-lg border border-[#eceef1] bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#9ca3af]">
                      {selectedItem.platform}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#111111]">
                      {selectedItem.title}
                    </h3>
                  </div>

                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-medium ${statusBadgeClass(
                      selectedItem.status
                    )}`}
                  >
                    {selectedItem.status}
                  </span>
                </div>

                <div className="mt-6 grid gap-3">
                  <div className="rounded-lg bg-[#fafafa] p-4">
                    <p className="text-xs font-medium text-[#9ca3af]">기간</p>
                    <p className="mt-2 text-sm font-semibold text-[#111111]">
                      {selectedItem.start_date} ~ {selectedItem.end_date}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#fafafa] p-4">
                    <p className="text-xs font-medium text-[#9ca3af]">플랫폼</p>
                    <p className="mt-2 text-sm font-semibold text-[#111111]">
                      {selectedItem.platform}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#fafafa] p-4">
                    <p className="text-xs font-medium text-[#9ca3af]">참여 상태</p>
                    <p className="mt-2 text-sm font-semibold text-[#111111]">
                      {selectedItem.participation_status || '-'}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#fafafa] p-4">
                    <p className="text-xs font-medium text-[#9ca3af]">담당자</p>
                    <p className="mt-2 text-sm font-semibold text-[#111111]">
                      {selectedItem.owner || '-'}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#fafafa] p-4">
                    <p className="text-xs font-medium text-[#9ca3af]">할인 조건</p>
                    <p className="mt-2 text-sm font-semibold text-[#111111]">
                      {selectedItem.discount || '-'}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#fafafa] p-4">
                    <p className="text-xs font-medium text-[#9ca3af]">메모</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#4b5563]">
                      {selectedItem.memo || '등록된 메모가 없습니다.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#f0f1f3] px-6 py-5">
              <Link
                href={`/exhibitions/${selectedItem.id}`}
                className="block w-full rounded-lg bg-black px-4 py-3 text-center text-sm font-medium text-white hover:bg-[#1f2937]"
              >
                상세 페이지로 이동
              </Link>
            </div>
          </aside>
        </>
      )}
    </>
  )
}