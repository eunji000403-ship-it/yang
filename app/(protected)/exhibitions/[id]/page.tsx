'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Exhibition = {
  id: string
  title: string
  platform: string
  status: string
  start_date: string
  end_date: string
  owner?: string | null
  memo?: string | null
}

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

export default function ExhibitionDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

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
    return <div className="text-sm text-[#6b7280]">불러오는 중...</div>
  }

  if (!item) {
    return <div className="text-sm text-[#6b7280]">데이터가 없습니다.</div>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/exhibitions"
          className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm text-[#374151]"
        >
          목록으로
        </Link>

        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/exhibitions/edit/${item.id}`)}
            className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-medium text-[#374151]"
          >
            수정
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-[#9ca3af]">{item.platform}</p>
            <h1 className="mt-2 text-2xl font-bold text-[#111111]">{item.title}</h1>
          </div>
          <StatusBadge status={item.status} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-[#fafafa] p-4">
            <p className="text-sm text-[#9ca3af]">시작일</p>
            <p className="mt-2 font-semibold text-[#111111]">{item.start_date}</p>
          </div>

          <div className="rounded-lg bg-[#fafafa] p-4">
            <p className="text-sm text-[#9ca3af]">종료일</p>
            <p className="mt-2 font-semibold text-[#111111]">{item.end_date}</p>
          </div>

          <div className="rounded-lg bg-[#fafafa] p-4">
            <p className="text-sm text-[#9ca3af]">담당자</p>
            <p className="mt-2 font-semibold text-[#111111]">{item.owner || '-'}</p>
          </div>

          <div className="rounded-lg bg-[#fafafa] p-4">
            <p className="text-sm text-[#9ca3af]">상태</p>
            <p className="mt-2 font-semibold text-[#111111]">{item.status}</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-[#fafafa] p-4">
          <p className="text-sm text-[#9ca3af]">메모</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#374151]">
            {item.memo || '메모가 없습니다.'}
          </p>
        </div>
      </div>
    </div>
  )
}