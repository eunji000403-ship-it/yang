'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Sale = {
  id: string
  title: string
  platform: string
  amount: number
  created_at?: string
}

const PLATFORM_FILTERS = ['전체', '29CM', '무신사', '자사몰', '지그재그', 'W컨셉']

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState('29CM')
  const [amount, setAmount] = useState('')
  const [filter, setFilter] = useState('전체')
  const [loading, setLoading] = useState(true)

  const loadSales = async () => {
    const { data } = await supabase
      .from('sales')
      .select('*')
      .order('id', { ascending: false })

    setSales((data as Sale[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    loadSales()
  }, [])

  const filtered = useMemo(() => {
    if (filter === '전체') return sales
    return sales.filter((item) => item.platform === filter)
  }, [sales, filter])

  const total = useMemo(() => {
    return filtered.reduce((sum, item) => sum + item.amount, 0)
  }, [filtered])

  const handleAdd = async () => {
    if (!title || !amount) return alert('입력해주세요')

    await supabase.from('sales').insert({
      title,
      platform,
      amount: Number(amount),
    })

    setTitle('')
    setAmount('')
    loadSales()
  }

  if (loading) {
    return <div className="p-4 text-sm">매출 불러오는 중...</div>
  }

  return (
    <div className="space-y-6">

      {/* 헤더 */}
      <div>
        <h1 className="text-xl font-bold">매출 관리</h1>
        <p className="text-sm text-gray-500">기획전별 매출을 관리할 수 있어요</p>
      </div>

      {/* 총 매출 */}
      <div className="rounded-lg border p-5 bg-white">
        <p className="text-sm text-gray-500">총 매출</p>
        <p className="text-2xl font-bold mt-2">
          {total.toLocaleString()}원
        </p>
      </div>

      {/* 입력 */}
      <div className="rounded-lg border p-5 bg-white space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="기획전명"
          className="w-full border px-3 py-2 rounded"
        />

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          {PLATFORM_FILTERS.slice(1).map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="매출 금액"
          type="number"
          className="w-full border px-3 py-2 rounded"
        />

        <button
          onClick={handleAdd}
          className="w-full bg-black text-white py-2 rounded"
        >
          등록하기
        </button>
      </div>

      {/* 필터 */}
      <div className="flex gap-2 flex-wrap">
        {PLATFORM_FILTERS.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === item ? 'bg-black text-white' : 'bg-gray-100'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* 리스트 */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 bg-white flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-gray-500">{item.platform}</p>
            </div>

            <p className="font-bold">
              {item.amount.toLocaleString()}원
            </p>
          </div>
        ))}
      </div>

    </div>
  )
}