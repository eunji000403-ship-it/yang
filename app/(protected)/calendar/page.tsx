'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  getCalendarEventClass,
  getDisplayStatus,
  getStatusTextClass,
} from '@/lib/exhibitionStatus'

type Exhibition = {
  id: string
  title: string
  platform: string
  status: string | null
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
  const displayStatus = getDisplayStatus(item)

  return {
    id: item.id,
    title: item.title,
    start: item.start_date,
    end: item.end_date,
    allDay: true,
    extendedProps: {
      platform: item.platform,
      status: displayStatus,
      exhibition: item,
    },
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
    return <div className="p-4 text-sm text-[#8b95a1] md:p-8">캘린더 불러오는 중...</div>
  }

  return (
    <>
      <div className="space-y-4 md:space-y-6">
        <div className="mb-1 md:mb-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-[20px] font-bold text-[#111111] md:text-[22px]">
                캘린더
              </h1>
              <p className="mt-1 text-sm text-[#6b7280]">
                기획전 일정을 한눈에 확인할 수 있어요.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              {['전체', '29CM', '무신사', '자사몰', '지그재그', 'W컨셉'].map((item) => (
                <button
                  key={item}
                  onClick={() => setSelectedPlatform(item)}
                  className={`px-3 py-2 text-sm transition md:px-4 ${
                    selectedPlatform === item
                      ? 'border border-[#111111] bg-[#f3f4f6] text-[#111111]'
                      : 'border border-[#e5e7eb] bg-white text-[#6b7280] hover:border-[#111111] hover:text-[#111111]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="calendar-shell border border-[#e5e7eb] bg-white p-2 md:p-4">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            height="auto"
            locale="ko"
            editable={false}
            selectable={false}
            dayMaxEvents={4}
            dayMaxEventRows={4}
            moreLinkText={(n) => `+${n} more`}
            headerToolbar={{
              left: '',
              center: 'prev title next',
              right: '',
            }}
            buttonText={{
              today: '오늘',
            }}
            titleFormat={{ year: 'numeric', month: 'long' }}
            events={filteredEvents}
            eventClick={(info) => {
              const exhibition = info.event.extendedProps.exhibition as Exhibition
              setSelectedItem(exhibition)
            }}
            eventContent={(arg) => {
              const status = arg.event.extendedProps.status as string
              const platform = arg.event.extendedProps.platform as string
              const exhibition = arg.event.extendedProps.exhibition as Exhibition

              return (
                <div className={`highlight-event-card ${getCalendarEventClass(status)}`}>
                  <span className="highlight-event-title">
                    [{platform}] {exhibition.title}
                  </span>
                  <span className="highlight-event-status">{status}</span>
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

          <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-full flex-col border-l border-[#e5e7eb] bg-white shadow-2xl md:max-w-[420px]">
            <div className="flex items-center justify-between border-b border-[#f0f1f3] px-4 py-4 md:px-6 md:py-5">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#9ca3af]">
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

            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
              <div className="rounded-lg border border-[#eceef1] bg-white p-4 md:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#9ca3af]">
                      {selectedItem.platform}
                    </p>
                    <h3 className="mt-2 break-words text-xl font-bold tracking-tight text-[#111111] md:text-2xl">
                      {selectedItem.title}
                    </h3>
                  </div>

                  <span className={`shrink-0 text-sm ${getStatusTextClass(getDisplayStatus(selectedItem))}`}>
                    {getDisplayStatus(selectedItem)}
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
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
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#4b5563]">
                      {selectedItem.memo || '등록된 메모가 없습니다.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#f0f1f3] px-4 py-4 md:px-6 md:py-5">
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

      <style jsx global>{`
        .calendar-shell .fc {
          --fc-border-color: #eef0f3;
          --fc-page-bg-color: #ffffff;
          --fc-neutral-bg-color: #fafafa;
          --fc-button-text-color: #111111;
          --fc-button-bg-color: #ffffff;
          --fc-button-border-color: #e5e7eb;
          --fc-button-hover-bg-color: #fafafa;
          --fc-button-hover-border-color: #111111;
          --fc-button-active-bg-color: #f3f4f6;
          --fc-button-active-border-color: #111111;
          --fc-today-bg-color: transparent;
        }

        .calendar-shell .fc-toolbar {
          margin-bottom: 16px !important;
          align-items: center;
        }

        .calendar-shell .fc-header-toolbar {
          justify-content: center;
        }

        .calendar-shell .fc-toolbar-title {
          font-size: 20px !important;
          font-weight: 700 !important;
          color: #111111;
          letter-spacing: -0.02em;
          min-width: 140px;
          text-align: center;
        }

        .calendar-shell .fc-header-toolbar .fc-toolbar-chunk {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .calendar-shell .fc .fc-button {
          box-shadow: none !important;
          border-radius: 9999px !important;
          padding: 6px 10px !important;
          font-size: 13px !important;
          font-weight: 500 !important;
        }

        .calendar-shell .fc .fc-prev-button,
        .calendar-shell .fc .fc-next-button {
          width: 34px;
          height: 34px;
          padding: 0 !important;
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
        }

        .calendar-shell .fc .fc-daygrid-day-frame {
          min-height: 124px;
        }

        .calendar-shell .fc .fc-daygrid-more-link {
          margin-top: 2px;
          font-size: 11px;
          color: #6b7280;
        }

        .calendar-shell .fc .fc-col-header-cell-cushion {
          padding: 10px 0;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-decoration: none;
        }

        .calendar-shell .fc .fc-daygrid-day-number {
          padding: 8px;
          font-size: 12px;
          color: #6b7280;
          text-decoration: none;
        }

        .calendar-shell .fc-event {
          border: 0 !important;
          background: transparent !important;
        }

        .highlight-event-card {
          width: 100%;
          overflow: hidden;
          border-radius: 6px;
          padding: 4px 6px;
          font-size: 11px;
          line-height: 1.35;
        }

        .highlight-event-title {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .highlight-event-status {
          display: block;
          margin-top: 2px;
          font-size: 10px;
          opacity: 0.95;
        }

        .highlight-green {
          background: #111111;
          color: #ffffff;
        }

        .highlight-blue {
          background: #f3f4f6;
          color: #6b7280;
        }

        .highlight-gray {
          background: #f8f9fa;
          color: #c0c4cc;
        }

        @media (max-width: 768px) {
          .calendar-shell .fc-toolbar {
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }

          .calendar-shell .fc-toolbar-title {
            font-size: 18px !important;
          }

          .calendar-shell .fc .fc-daygrid-day-frame {
            min-height: 88px;
          }

          .highlight-event-card {
            padding: 3px 5px;
            font-size: 10px;
          }

          .highlight-event-status {
            font-size: 9px;
          }
        }
      `}</style>
    </>
  )
}