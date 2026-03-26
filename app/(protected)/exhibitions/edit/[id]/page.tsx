'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function EditExhibitionPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState('29CM')
  const [status, setStatus] = useState('예정')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [owner, setOwner] = useState('')
  const [memo, setMemo] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadData = async () => {
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

      setTitle(data.title || '')
      setPlatform(data.platform || '29CM')
      setStatus(data.status || '예정')
      setStartDate(data.start_date || '')
      setEndDate(data.end_date || '')
      setOwner(data.owner || '')
      setMemo(data.memo || '')
      setLoading(false)
    }

    loadData()
  }, [id, router])

  const handleSave = async () => {
    if (!title.trim() || !platform || !status || !startDate || !endDate) {
      alert('기획전명, 플랫폼, 상태, 시작일, 종료일을 입력해주세요.')
      return
    }

    if (startDate > endDate) {
      alert('종료일은 시작일보다 빠를 수 없어요.')
      return
    }

    try {
      setSaving(true)

      const { error } = await supabase
        .from('exhibitions')
        .update({
          title: title.trim(),
          platform,
          status,
          start_date: startDate,
          end_date: endDate,
          owner: owner.trim() || null,
          memo: memo.trim() || null,
        })
        .eq('id', id)

      if (error) {
        alert(error.message || '수정에 실패했어요.')
        setSaving(false)
        return
      }

      alert('수정 완료!')
      router.push(`/exhibitions/${id}`)
    } catch (error) {
      console.error(error)
      alert('수정 중 오류가 발생했어요.')
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-4 text-sm text-[#8b95a1] md:p-8">불러오는 중...</div>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-[20px] font-bold text-[#111111] md:text-[22px]">
          기획전 수정
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          기존 기획전 정보를 수정할 수 있어요.
        </p>
      </div>

      <div className="rounded-lg border border-[#e5e7eb] bg-white p-5 md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[#374151]">
              기획전명
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm outline-none focus:border-black"
              placeholder="기획전명"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#374151]">
              플랫폼
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm outline-none focus:border-black"
            >
              <option value="29CM">29CM</option>
              <option value="무신사">무신사</option>
              <option value="자사몰">자사몰</option>
              <option value="지그재그">지그재그</option>
              <option value="W컨셉">W컨셉</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#374151]">
              상태
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm outline-none focus:border-black"
            >
              <option value="예정">예정</option>
              <option value="준비중">준비중</option>
              <option value="진행중">진행중</option>
              <option value="종료">종료</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#374151]">
              시작일
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#374151]">
              종료일
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#374151]">
              담당자
            </label>
            <input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm outline-none focus:border-black"
              placeholder="담당자"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[#374151]">
              메모
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="min-h-[120px] w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm leading-6 outline-none focus:border-black"
              placeholder="메모"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={() => router.push(`/exhibitions/${id}`)}
            className="rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm font-medium text-[#374151]"
          >
            취소
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? '저장 중...' : '수정 저장'}
          </button>
        </div>
      </div>
    </div>
  )
}