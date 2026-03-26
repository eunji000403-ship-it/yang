'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Sale = {
  id: string
  title: string | null
  platform: string | null
  amount: number | null
  created_at?: string | null
}

const PLATFORM_FILTERS = ['전체', '29CM', '무신사', '자사몰', '지그재그', 'W컨셉']

function formatDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [filter, setFilter] = useState('전체')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadSales = async () => {
      try {
        const { data, error } = await supabase
          .from('sales')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('sales load error:', error)
          setErrorMessage(error.message || '매출 데이터를 불러오지 못했어요.')
          setSales([])
          setLoading(false)
          return
        }

        setSales((data as Sale[]) || [])
        setLoading(false)
      } catch (error) {
        console.error('sales unexpected error:', error)
        setErrorMessage('페이지를 불러오는 중 오류가 발생했어요.')
        setSales([])
        setLoading(false)
      }
    }

    loadSales()
  }, [])

  const filtered = useMemo(() => {
    if (filter === '전체') return sales
    return sales.filter((item) => item.platform === filter)
  }, [sales, filter])

  const total = useMemo(() => {
    return filtered.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  }, [filtered])

  const average = useMemo(() => {
    if (filtered.length === 0) return 0
    return Math.round(total / filtered.length)
  }, [filtered, total])

  if (loading) {
    return <div className="p-4 text-sm text-[#8b95a1] md:p-8">매출 불러오는 중...</div>
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <div>
        <h1 className="text-[20px] font-bold text-[#111111] md:text-[22px]">
          매출 관리
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          기획전별 매출을 확인할 수 있어요.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-[#fecaca] bg-[#fff7f7] p-4 text-sm text-[#b91c1c]">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-5">
          <p className="text-sm text-[#6b7280]">총 매출</p>
          <p className="mt-3 text-2xl font-bold text-[#111111]">
            {total.toLocaleString()}원
          </p>
          <p className="mt-2 text-sm text-[#6b7280]">현재 필터 기준</p>
        </div>

        <div className="rounded-lg border border-[#e5e7eb] bg-white p-5">
          <p className="text-sm text-[#6b7280]">평균 매출</p>
          <p className="mt-3 text-2xl font-bold text-[#111111]">
            {average.toLocaleString()}원
          </p>
          <p className="mt-2 text-sm text-[#6b7280]">등록된 매출 평균</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PLATFORM_FILTERS.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-full px-4 py-2 text-sm ${
              filter === item
                ? 'bg-black text-white'
                : 'bg-[#f5f5f5] text-[#6b7280]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 md:p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-[#111111]">매출 목록</h2>
          <p className="mt-1 text-sm text-[#6b7280]">총 {filtered.length}건</p>
        </div>

        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-[#e5e7eb] p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-[#111111] md:text-base">
                    {item.title || '기획전명 없음'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#6b7280]">
                    <span>{item.platform || '-'}</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>

                <p className="shrink-0 text-base font-bold text-[#111111]">
                  {Number(item.amount || 0).toLocaleString()}원
                </p>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="rounded-lg border border-dashed border-[#e5e7eb] p-8 text-center text-sm text-[#9ca3af]">
              등록된 매출이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}