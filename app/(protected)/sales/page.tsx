'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts'

type Sale = {
  id: string
  title: string | null
  platform: string | null
  amount: number | null
  created_at?: string | null
}

type PeriodType = 'week' | 'month' | 'year'

const PLATFORM_FILTERS = ['전체', '29CM', '무신사', '자사몰', '지그재그', 'W컨셉']
const PLATFORM_ORDER = ['자사몰', '29CM', '무신사', '지그재그', 'W컨셉'] as const

const PLATFORM_COLORS: Record<string, string> = {
  자사몰: '#111111',
  '29CM': '#2563eb',
  무신사: '#16a34a',
  지그재그: '#db2777',
  'W컨셉': '#f59e0b',
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

function formatCurrency(value: number) {
  return `${value.toLocaleString()}원`
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function getDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getDateKeyFromValue(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return getDateKey(date)
}

function getMonthKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function getMonthKeyFromValue(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return getMonthKey(date)
}

function shortDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${m}.${d}`
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [filter, setFilter] = useState('전체')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState('29CM')
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)

  const [period, setPeriod] = useState<PeriodType>('week')

  const loadSales = async () => {
    try {
      setErrorMessage('')

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

  useEffect(() => {
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

  const yesterdayBarData = useMemo(() => {
    const yesterday = addDays(new Date(), -1)
    const yesterdayKey = getDateKey(yesterday)

    return PLATFORM_ORDER.map((platformName) => {
      const amount = sales
        .filter(
          (item) =>
            item.platform === platformName &&
            getDateKeyFromValue(item.created_at) === yesterdayKey
        )
        .reduce((sum, item) => sum + Number(item.amount || 0), 0)

      return {
        name: platformName,
        amount,
      }
    })
  }, [sales])

  const trendData = useMemo(() => {
    const now = new Date()

    if (period === 'week') {
      return Array.from({ length: 7 }).map((_, index) => {
        const date = addDays(now, -6 + index)
        const key = getDateKey(date)
        const label = `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`

        const row: Record<string, string | number> = { label }

        PLATFORM_ORDER.forEach((platformName) => {
          row[platformName] = sales
            .filter(
              (item) =>
                item.platform === platformName &&
                getDateKeyFromValue(item.created_at) === key
            )
            .reduce((sum, item) => sum + Number(item.amount || 0), 0)
        })

        return row
      })
    }

    if (period === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      const totalDays = end.getDate()

      return Array.from({ length: totalDays }).map((_, index) => {
        const date = addDays(start, index)
        const key = getDateKey(date)
        const label = `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`

        const row: Record<string, string | number> = { label }

        PLATFORM_ORDER.forEach((platformName) => {
          row[platformName] = sales
            .filter(
              (item) =>
                item.platform === platformName &&
                getDateKeyFromValue(item.created_at) === key
            )
            .reduce((sum, item) => sum + Number(item.amount || 0), 0)
        })

        return row
      })
    }

    return Array.from({ length: 12 }).map((_, index) => {
      const date = new Date(now.getFullYear(), index, 1)
      const key = getMonthKey(date)
      const label = `${index + 1}월`

      const row: Record<string, string | number> = { label }

      PLATFORM_ORDER.forEach((platformName) => {
        row[platformName] = sales
          .filter(
            (item) =>
              item.platform === platformName &&
              getMonthKeyFromValue(item.created_at) === key
          )
          .reduce((sum, item) => sum + Number(item.amount || 0), 0)
      })

      return row
    })
  }, [sales, period])

  const handleAdd = async () => {
    if (!title.trim() || !amount.trim()) {
      alert('기획전명과 매출 금액을 입력해주세요.')
      return
    }

    const parsedAmount = Number(amount)

    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      alert('매출 금액을 올바르게 입력해주세요.')
      return
    }

    try {
      setSaving(true)
      setErrorMessage('')

      const { error } = await supabase.from('sales').insert({
        title: title.trim(),
        platform,
        amount: parsedAmount,
      })

      if (error) {
        console.error('sales insert error:', error)
        alert(error.message || '매출 등록에 실패했어요.')
        setSaving(false)
        return
      }

      setTitle('')
      setPlatform('29CM')
      setAmount('')
      setSaving(false)
      loadSales()
    } catch (error) {
      console.error('sales insert unexpected error:', error)
      alert('매출 등록 중 오류가 발생했어요.')
      setSaving(false)
    }
  }

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
          기획전별 매출을 등록하고 확인할 수 있어요.
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

      <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 md:p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-[#111111]">매출 등록</h2>
          <p className="mt-1 text-sm text-[#6b7280]">기획전명과 매출 금액을 입력하세요.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="기획전명"
            className="w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm outline-none focus:border-black"
          />

          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm outline-none focus:border-black"
          >
            {PLATFORM_FILTERS.slice(1).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="매출 금액"
            type="number"
            min="0"
            className="w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm outline-none focus:border-black"
          />
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={handleAdd}
            disabled={saving}
            className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-50 md:w-auto"
          >
            {saving ? '등록 중...' : '등록하기'}
          </button>
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 md:p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[#111111]">어제 플랫폼별 매출</h2>
            <p className="mt-1 text-sm text-[#6b7280]">어제 날짜 기준 막대 비교</p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yesterdayBarData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${Math.round(Number(value) / 10000)}만`}
                />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {yesterdayBarData.map((entry) => (
                    <Cell key={entry.name} fill={PLATFORM_COLORS[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 md:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#111111]">플랫폼별 매출 추이</h2>
              <p className="mt-1 text-sm text-[#6b7280]">주 / 월 / 년 기준 꺾은선 비교</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPeriod('week')}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  period === 'week' ? 'bg-black text-white' : 'bg-[#f5f5f5] text-[#6b7280]'
                }`}
              >
                주
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  period === 'month' ? 'bg-black text-white' : 'bg-[#f5f5f5] text-[#6b7280]'
                }`}
              >
                월
              </button>
              <button
                onClick={() => setPeriod('year')}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  period === 'year' ? 'bg-black text-white' : 'bg-[#f5f5f5] text-[#6b7280]'
                }`}
              >
                년
              </button>
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${Math.round(Number(value) / 10000)}만`}
                />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                {PLATFORM_ORDER.map((platformName) => (
                  <Line
                    key={platformName}
                    type="monotone"
                    dataKey={platformName}
                    stroke={PLATFORM_COLORS[platformName]}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
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