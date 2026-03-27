'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
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
  memo?: string | null
  revenue?: number | null
  roas?: number | null
}

function formatRevenue(value?: number | null) {
  if (value === null || value === undefined) return '-'
  return `${Number(value).toLocaleString()}원`
}

function formatRoas(value?: number | null) {
  if (value === null || value === undefined) return '-'
  return `${Number(value)}%`
}

export default function ExhibitionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [item, setItem] = useState<Exhibition | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchDetail = async () => {
      const { data, error } = await supabase
        .from('exhibitions')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        alert('기획전 정보를 불러올 수 없어요.')
        router.push('/exhibitions')
        return
      }

      setItem(data as Exhibition)
      setLoading(false)
    }

    fetchDetail()
  }, [id, router])

  const handleDelete = async () => {
    const ok = window.confirm('이 기획전을 삭제할까요?')
    if (!ok) return

    try {
      setDeleting(true)

      const { error } = await supabase
        .from('exhibitions')
        .delete()
        .eq('id', id)

      if (error) {
        alert(error.message || '삭제에 실패했어요.')
        setDeleting(false)
        return
      }

      alert('삭제되었어요.')
      router.push('/exhibitions')
    } catch (error) {
      console.error(error)
      alert('삭제 중 오류가 발생했어요.')
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="p-4 text-sm text-[#8b95a1] md:p-8">불러오는 중...</div>
  }

  if (!item) {
    return <div className="p-4 text-sm text-[#8b95a1] md:p-8">데이터가 없습니다.</div>
  }

  const displayStatus = getDisplayStatus(item)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/exhibitions"
          className="ui-btn w-fit"
        >
          목록으로
        </Link>

        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/exhibitions/edit/${item.id}`)}
            className="ui-btn"
          >
            수정
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="ui-btn ui-btn-primary"
          >
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>

      <div className="ui-card p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#9ca3af]">{item.platform}</p>
            <h1 className="mt-2 break-words text-[26px] font-semibold tracking-[-0.03em] text-[#111111]">
              {item.title}
            </h1>
          </div>

          <span className={`shrink-0 text-sm ${getStatusTextClass(displayStatus)}`}>
            {displayStatus}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="border border-[#eef0f3] bg-[#fafafa] p-4">
            <p className="text-xs font-medium text-[#9ca3af]">시작일</p>
            <p className="mt-2 text-sm font-semibold text-[#111111]">
              {item.start_date || '-'}
            </p>
          </div>

          <div className="border border-[#eef0f3] bg-[#fafafa] p-4">
            <p className="text-xs font-medium text-[#9ca3af]">종료일</p>
            <p className="mt-2 text-sm font-semibold text-[#111111]">
              {item.end_date || '-'}
            </p>
          </div>

          <div className="border border-[#eef0f3] bg-[#fafafa] p-4">
            <p className="text-xs font-medium text-[#9ca3af]">담당자</p>
            <p className="mt-2 text-sm font-semibold text-[#111111]">
              {item.owner || '-'}
            </p>
          </div>

          <div className="border border-[#eef0f3] bg-[#fafafa] p-4">
            <p className="text-xs font-medium text-[#9ca3af]">플랫폼</p>
            <p className="mt-2 text-sm font-semibold text-[#111111]">
              {item.platform || '-'}
            </p>
          </div>

          <div className="border border-[#eef0f3] bg-[#fafafa] p-4">
            <p className="text-xs font-medium text-[#9ca3af]">매출</p>
            <p className="mt-2 text-sm font-semibold text-[#111111]">
              {formatRevenue(item.revenue)}
            </p>
          </div>

          <div className="border border-[#eef0f3] bg-[#fafafa] p-4">
            <p className="text-xs font-medium text-[#9ca3af]">ROAS</p>
            <p className="mt-2 text-sm font-semibold text-[#111111]">
              {formatRoas(item.roas)}
            </p>
          </div>
        </div>

        <div className="mt-4 border border-[#eef0f3] bg-[#fafafa] p-4">
          <p className="text-xs font-medium text-[#9ca3af]">메모</p>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#4b5563]">
            {item.memo || '등록된 메모가 없습니다.'}
          </p>
        </div>
      </div>
    </div>
  )
}