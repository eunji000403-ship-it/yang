'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Exhibition = {
  id: string
  title: string
  platform: string
  status: string
  start_date?: string
  end_date?: string
}

const PLATFORM_FILTERS = ['전체', '29CM', '무신사', '자사몰', '지그재그', 'W컨셉']

function StatusBadge({ status }: { status: string }) {
  const className =
    status === '진행중'
      ? 'bg-black text-white'
      : status === '예정'
      ? 'bg-[#f3f4f6] text-black'
      : status === '준비중'
      ? 'bg-[#f5f5f5] text-[#374151]'
      : 'bg-[#e5e7eb] text-[#6b7280]'

  return (
    <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${className}`}>
      {status}
    </span>
  )
}

export default function ExhibitionsPage() {
  const [data, setData] = useState<Exhibition[]>([])
  const [activeFilter, setActiveFilter] = useState('전체')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('exhibitions')
        .select('*')
        .order('id', { ascending: false })

      setData((data as Exhibition[]) || [])
    }

    fetchData()
  }, [])

  const filtered = useMemo(() => {
    let result = [...data]

    if (activeFilter !== '전체') {
      result = result.filter((item) => item.platform === activeFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.platform.toLowerCase().includes(q)
      )
    }

    return result
  }, [data, activeFilter, search])

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-[20px] font-bold text-[#111111] md:text-[22px]">
          기획전 관리
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">ILANG internal workspace</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {PLATFORM_FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveFilter(item)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                activeFilter === item
                  ? 'bg-black text-white'
                  : 'bg-[#f5f5f5] text-[#6b7280]'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <Link
          href="/exhibitions/create"
          className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937]"
        >
          + 기획전 등록
        </Link>
      </div>

      <div>
        <input
          placeholder="기획전명 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm text-[#111111] outline-none focus:border-black"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-[#e5e7eb] p-5">
          <p className="text-sm text-[#6b7280]">전체 기획전</p>
          <p className="mt-2 text-2xl font-bold text-[#111111]">{data.length}</p>
        </div>

        <div className="rounded-lg border border-[#e5e7eb] p-5">
          <p className="text-sm text-[#6b7280]">진행중</p>
          <p className="mt-2 text-2xl font-bold text-[#111111]">
            {data.filter((item) => item.status === '진행중').length}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#e5e7eb]">
        <table className="min-w-[680px] w-full text-sm">
          <thead className="bg-[#fafafa] text-[#374151]">
            <tr>
              <th className="px-4 py-3 text-left font-medium">기획전명</th>
              <th className="px-4 py-3 text-left font-medium">플랫폼</th>
              <th className="px-4 py-3 text-left font-medium">상태</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.id}
                className="border-t transition hover:bg-[#f7f7f7]"
              >
                <td className="px-4 py-4">
                  <Link
                    href={`/exhibitions/${item.id}`}
                    className="block font-medium text-[#111111] hover:underline"
                  >
                    {item.title}
                  </Link>
                </td>
                <td className="px-4 py-4 text-[#4b5563]">{item.platform}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-[#9ca3af]">
                  데이터가 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}