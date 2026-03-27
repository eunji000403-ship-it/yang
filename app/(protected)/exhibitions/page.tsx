'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

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

const STATUS_OPTIONS = ['전체', '예정', '진행중', '종료']
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

function getDateOnly(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getDisplayStatus(item: Exhibition) {
  const today = new Date()
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const start = getDateOnly(item.start_date)
  const end = getDateOnly(item.end_date)

  if (!start || !end) return item.status || '-'

  if (todayOnly < start) return '예정'
  if (todayOnly > end) return '종료'
  return '진행중'
}

function getStatusTone(status?: string | null) {
  switch (status) {
    case '진행중':
      return 'text-[#111111] font-semibold'
    case '준비중':
      return 'text-[#6b7280] font-medium'
    case '예정':
      return 'text-[#9ca3af] font-medium'
    case '종료':
      return 'text-[#d1d5db] font-medium'
    default:
      return 'text-[#6b7280] font-medium'
  }
}

export default function ExhibitionsPage() {
  const [items, setItems] = useState<Exhibition[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('전체')
  const [platformFilter, setPlatformFilter] = useState('전체')

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleting, setDeleting] = useState(false)

  const loadExhibitions = async () => {
    try {
      setErrorMessage('')

      const { data, error } = await supabase
        .from('exhibitions')
        .select('*')
        .order('start_date', { ascending: false })

      if (error) {
        console.error(error)
        setErrorMessage(error.message || '기획전 목록을 불러오지 못했어요.')
        setItems([])
        setLoading(false)
        return
      }

      setItems((data as Exhibition[]) || [])
      setLoading(false)
    } catch (error) {
      console.error(error)
      setErrorMessage('기획전 목록을 불러오는 중 오류가 발생했어요.')
      setItems([])
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExhibitions()
  }, [])

  const filteredItems = useMemo(() => {
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
    filteredItems.length > 0 &&
    filteredItems.every((item) => selectedIds.includes(item.id))

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !filteredItems.some((item) => item.id === id))
      )
      return
    }

    const visibleIds = filteredItems.map((item) => item.id)
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
        alert(error.message || '삭제에 실패했어요.')
        setDeleting(false)
        return
      }

      setSelectedIds([])
      setDeleting(false)
      loadExhibitions()
    } catch (error) {
      console.error(error)
      alert('삭제 중 오류가 발생했어요.')
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="p-4 text-sm text-[#6b7280] md:p-8">불러오는 중...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#111111]">
            기획전 관리
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            기획전 등록, 수정, 삭제 및 상태 확인
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={handleDeleteSelected}
            disabled={deleting || selectedIds.length === 0}
            className="border border-[#dcdfe4] bg-white px-4 py-2.5 text-sm font-medium text-[#111111] transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleting ? '삭제 중...' : `선택 삭제${selectedIds.length ? ` (${selectedIds.length})` : ''}`}
          </button>

          <Link
            href="/exhibitions/create"
            className="border border-black bg-black px-4 py-2.5 text-center text-sm font-medium text-white transition"
          >
            새 기획전 등록
          </Link>
        </div>
      </div>

      {errorMessage ? (
        <div className="border border-[#f1caca] bg-[#fff8f8] px-4 py-3 text-sm text-[#b42318]">
          {errorMessage}
        </div>
      ) : null}

      <div className="border border-[#e5e7eb] bg-white">
        <div className="grid grid-cols-1 gap-3 border-b border-[#e5e7eb] p-4 md:grid-cols-[1.5fr_160px_160px_100px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="기획전명, 플랫폼, 담당자 검색"
            className="w-full border border-[#dcdfe4] bg-white px-3 py-2.5 text-sm text-[#111111] outline-none placeholder:text-[#9ca3af] focus:border-black"
          />

          <div className="ui-select-wrap">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="ui-select"
            >
              {PLATFORM_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="ui-select-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="ui-select"
            >
              {STATUS_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center justify-start gap-2 text-sm text-[#111111]">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAllVisible}
              className="h-4 w-4 rounded-none border-[#cfd4dc] text-black focus:ring-0"
            />
            전체 선택
          </label>
        </div>

        <div className="flex items-center justify-between border-b border-[#eef0f3] px-4 py-3 text-sm text-[#6b7280]">
          <span>총 {filteredItems.length}건</span>
          <span className="hidden md:block text-[#9ca3af]">
            상태는 날짜 기준으로 자동 표시됩니다
          </span>
        </div>

        <div className="hidden md:block">
          <div className="grid grid-cols-[48px_1.8fr_140px_120px_140px_140px_120px] border-b border-[#e5e7eb] bg-[#fafafa] px-4 py-3 text-xs font-medium uppercase tracking-[0.04em] text-[#6b7280]">
            <div />
            <div>기획전명</div>
            <div>플랫폼</div>
            <div>상태</div>
            <div>시작일</div>
            <div>종료일</div>
            <div>담당자</div>
          </div>

          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const displayStatus = getDisplayStatus(item)

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[48px_1.8fr_140px_120px_140px_140px_120px] items-center border-b border-[#eef0f3] px-4 py-4 text-sm text-[#111111] transition hover:bg-[#fcfcfc]"
                >
                  <div>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="h-4 w-4 rounded-none border-[#cfd4dc] text-black focus:ring-0"
                    />
                  </div>

                  <Link href={`/exhibitions/${item.id}`} className="min-w-0">
                    <p className="truncate font-medium">{item.title || '기획전명 없음'}</p>
                    {item.memo ? (
                      <p className="mt-1 truncate text-xs text-[#9ca3af]">{item.memo}</p>
                    ) : null}
                  </Link>

                  <div>{item.platform || '-'}</div>

                  <div>
                    <span className={getStatusTone(displayStatus)}>
                      {displayStatus || '-'}
                    </span>
                  </div>

                  <div>{formatDate(item.start_date)}</div>
                  <div>{formatDate(item.end_date)}</div>
                  <div>{item.owner || '-'}</div>
                </div>
              )
            })
          ) : (
            <div className="p-10 text-center text-sm text-[#9ca3af]">
              등록된 기획전이 없습니다.
            </div>
          )}
        </div>

        <div className="md:hidden">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const displayStatus = getDisplayStatus(item)

              return (
                <div key={item.id} className="border-b border-[#eef0f3] p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="mt-1 h-4 w-4 rounded-none border-[#cfd4dc] text-black focus:ring-0"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/exhibitions/${item.id}`} className="min-w-0">
                          <p className="break-words font-medium text-[#111111]">
                            {item.title || '기획전명 없음'}
                          </p>
                        </Link>

                        <span className={getStatusTone(displayStatus)}>
                          {displayStatus || '-'}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-[#6b7280]">
                        <div>
                          <p className="text-[11px] text-[#9ca3af]">플랫폼</p>
                          <p className="mt-1 text-[#111111]">{item.platform || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#9ca3af]">담당자</p>
                          <p className="mt-1 text-[#111111]">{item.owner || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#9ca3af]">시작일</p>
                          <p className="mt-1 text-[#111111]">{formatDate(item.start_date)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#9ca3af]">종료일</p>
                          <p className="mt-1 text-[#111111]">{formatDate(item.end_date)}</p>
                        </div>
                      </div>

                      {item.memo ? (
                        <p className="mt-3 line-clamp-2 text-sm text-[#9ca3af]">{item.memo}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-10 text-center text-sm text-[#9ca3af]">
              등록된 기획전이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}