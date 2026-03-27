'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  getDisplayStatus,
  getStatusTextClass,
} from '@/lib/exhibitionStatus'

type Exhibition = {
  id: string
  title: string | null
  platform: string | null
  status: string | null
  start_date: string | null
  end_date: string | null
  owner?: string | null
  memo?: string | null
  revenue?: number | null
  roas?: number | null
}

const STATUS_OPTIONS = ['전체', '진행중', '예정', '종료']
const PLATFORM_OPTIONS = ['전체', '29CM', '무신사', '자사몰', '지그재그', 'W컨셉']

function formatDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
}

export default function ExhibitionsPage() {
  const [items, setItems] = useState<Exhibition[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('전체')
  const [platformFilter, setPlatformFilter] = useState('전체')

  const loadData = async () => {
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
    loadData()
  }, [])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const displayStatus = getDisplayStatus(item)

      if (statusFilter !== '전체' && displayStatus !== statusFilter) {
        return false
      }

      if (platformFilter !== '전체' && item.platform !== platformFilter) {
        return false
      }

      return true
    })
  }, [items, statusFilter, platformFilter])

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">불러오는 중...</div>
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl font-bold text-[#111] md:text-2xl">
          기획전 관리
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          전체 기획전과 성과를 확인할 수 있어요
        </p>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((item) => (
          <button
            key={item}
            onClick={() => setStatusFilter(item)}
            className={`px-3 py-2 text-sm ${
              statusFilter === item
                ? 'bg-black text-white'
                : 'border border-gray-200 text-gray-600'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {PLATFORM_OPTIONS.map((item) => (
          <button
            key={item}
            onClick={() => setPlatformFilter(item)}
            className={`px-3 py-2 text-sm ${
              platformFilter === item
                ? 'bg-black text-white'
                : 'border border-gray-200 text-gray-600'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* 리스트 */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const displayStatus = getDisplayStatus(item)

          return (
            <Link
              key={item.id}
              href={`/exhibitions/${item.id}`}
              className="block border border-[#eee] bg-white p-4 hover:bg-[#fafafa]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400">{item.platform}</p>
                  <p className="mt-1 text-lg font-semibold text-[#111]">
                    {item.title}
                  </p>
                </div>

                <span className={`text-sm ${getStatusTextClass(displayStatus)}`}>
                  {displayStatus}
                </span>
              </div>

              <div className="mt-3 text-sm text-gray-500">
                {formatDate(item.start_date)} ~ {formatDate(item.end_date)}
              </div>

              <div className="mt-3 flex gap-4 text-sm">
                <span>
                  매출:{' '}
                  <b>
                    {item.revenue
                      ? item.revenue.toLocaleString() + '원'
                      : '-'}
                  </b>
                </span>
                <span>
                  ROAS:{' '}
                  <b>
                    {item.roas ? item.roas.toFixed(1) : '-'}
                  </b>
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}