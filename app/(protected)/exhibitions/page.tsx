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
}

const STATUS_OPTIONS = ['전체', '진행중', '예정', '종료']
const PLATFORM_OPTIONS = ['전체', '29CM', '무신사', '자사몰', '지그재그', 'W컨셉']

function formatDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

export default function ExhibitionsPage() {
  const [items, setItems] = useState<Exhibition[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('전체')
  const [platformFilter, setPlatformFilter] = useState('전체')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleting, setDeleting] = useState(false)

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

      const matchesSearch =
        !search.trim() ||
        (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.platform || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.owner || '').toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === '전체' || displayStatus === statusFilter

      const matchesPlatform =
        platformFilter === '전체' || item.platform === platformFilter

      return matchesSearch && matchesStatus && matchesPlatform
    })
  }, [items, search, statusFilter, platformFilter])

  const allVisibleSelected =
    filtered.length > 0 &&
    filtered.every((item) => selectedIds.includes(item.id))

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !filtered.some((item) => item.id === id))
      )
      return
    }

    const visibleIds = filtered.map((item) => item.id)
    setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])))
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      alert('삭제할 기획전을 선택해주세요.')
      return
    }

    const ok = window.confirm(`선택한 ${selectedIds.length}개 기획전을 삭제할까요?`)
    if (!ok) return

    try {
      setDeleting(true)

      const { error } = await supabase
        .from('exhibitions')
        .delete()
        .in('id', selectedIds)

      if (error) {
        console.error(error)
        alert(error.message || '삭제에 실패했어요.')
        setDeleting(false)
        return
      }

      setSelectedIds([])
      setDeleting(false)
      await loadData()
    } catch (error) {
      console.error(error)
      alert('삭제 중 오류가 발생했어요.')
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-[#8b95a1] md:p-8">불러오는 중...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#111111]">
          기획전 관리
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          전체 기획전과 상태를 확인할 수 있어요
        </p>
      </div>

      <div className="border border-[#e5e7eb] bg-white">
        <div className="grid grid-cols-1 gap-3 border-b border-[#eef0f3] p-4 md:grid-cols-[1.4fr_140px_140px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="기획전명, 플랫폼, 담당자 검색"
            className="h-11 w-full border border-[#dcdfe4] bg-white px-3 text-sm text-[#111111] outline-none placeholder:text-[#9ca3af] focus:border-[#111111]"
          />

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="h-11 w-full border border-[#dcdfe4] bg-white px-3 text-sm text-[#111111] outline-none focus:border-[#111111]"
          >
            {PLATFORM_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 w-full border border-[#dcdfe4] bg-white px-3 text-sm text-[#111111] outline-none focus:border-[#111111]"
          >
            {STATUS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-3 border-b border-[#eef0f3] px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-[#4b5563]">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded-none border-[#cfd4dc] text-black focus:ring-0"
              />
              전체 선택
            </label>

            <p className="text-sm text-[#6b7280]">총 {filtered.length}건</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteSelected}
              disabled={deleting || selectedIds.length === 0}
              className="border border-[#dcdfe4] bg-white px-4 py-2 text-sm font-medium text-[#111111] transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              {deleting ? '삭제 중...' : `선택 삭제${selectedIds.length ? ` (${selectedIds.length})` : ''}`}
            </button>

            <Link
              href="/exhibitions/create"
              className="border border-[#111111] bg-[#111111] px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
            >
              기획전 등록
            </Link>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="grid grid-cols-[44px_1.8fr_120px_110px_130px_130px_110px] border-b border-[#eef0f3] bg-[#fafafa] px-4 py-3 text-xs font-medium text-[#8b95a1]">
            <div />
            <div>기획전명</div>
            <div>플랫폼</div>
            <div>상태</div>
            <div>시작일</div>
            <div>종료일</div>
            <div>담당자</div>
          </div>

          {filtered.length > 0 ? (
            filtered.map((item) => {
              const displayStatus = getDisplayStatus(item)

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[44px_1.8fr_120px_110px_130px_130px_110px] items-center border-b border-[#f3f4f6] px-4 py-4 text-sm text-[#111111] transition hover:bg-[#fcfcfc]"
                >
                  <div>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="h-4 w-4 rounded-none border-[#cfd4dc] text-black focus:ring-0"
                    />
                  </div>

                  <Link href={`/exhibitions/${item.id}`} className="min-w-0 pr-4">
                    <p className="truncate font-medium text-[#111111]">
                      {item.title || '기획전명 없음'}
                    </p>
                    {item.memo ? (
                      <p className="mt-1 truncate text-xs text-[#9ca3af]">
                        {item.memo}
                      </p>
                    ) : null}
                  </Link>

                  <div className="text-[#4b5563]">{item.platform || '-'}</div>

                  <div>
                    <span className={`text-sm ${getStatusTextClass(displayStatus)}`}>
                      {displayStatus}
                    </span>
                  </div>

                  <div className="text-[#4b5563]">{formatDate(item.start_date)}</div>
                  <div className="text-[#4b5563]">{formatDate(item.end_date)}</div>
                  <div className="text-[#4b5563]">{item.owner || '-'}</div>
                </div>
              )
            })
          ) : (
            <div className="px-4 py-14 text-center text-sm text-[#9ca3af]">
              등록된 기획전이 없습니다.
            </div>
          )}
        </div>

        <div className="md:hidden">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const displayStatus = getDisplayStatus(item)

              return (
                <div
                  key={item.id}
                  className="border-b border-[#f3f4f6] px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="mt-1 h-4 w-4 rounded-none border-[#cfd4dc] text-black focus:ring-0"
                    />

                    <Link href={`/exhibitions/${item.id}`} className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-[#9ca3af]">{item.platform || '-'}</p>
                          <p className="mt-1 break-words font-medium text-[#111111]">
                            {item.title || '기획전명 없음'}
                          </p>
                        </div>

                        <span className={`shrink-0 text-sm ${getStatusTextClass(displayStatus)}`}>
                          {displayStatus}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <p className="text-[11px] text-[#9ca3af]">시작일</p>
                          <p className="mt-1 text-[#4b5563]">{formatDate(item.start_date)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#9ca3af]">종료일</p>
                          <p className="mt-1 text-[#4b5563]">{formatDate(item.end_date)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#9ca3af]">담당자</p>
                          <p className="mt-1 text-[#4b5563]">{item.owner || '-'}</p>
                        </div>
                      </div>

                      {item.memo ? (
                        <p className="mt-3 line-clamp-2 text-sm text-[#9ca3af]">
                          {item.memo}
                        </p>
                      ) : null}
                    </Link>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="px-4 py-14 text-center text-sm text-[#9ca3af]">
              등록된 기획전이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}