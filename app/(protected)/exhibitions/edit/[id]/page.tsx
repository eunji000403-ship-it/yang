'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function EditExhibitionPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState('29CM')
  const [status, setStatus] = useState('예정')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [owner, setOwner] = useState('')
  const [memo, setMemo] = useState('')
  const [revenue, setRevenue] = useState('')
  const [roas, setRoas] = useState('')
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
      setRevenue(data.revenue?.toString() || '')
      setRoas(data.roas?.toString() || '')
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

      const payload = {
        title: title.trim(),
        platform,
        status,
        start_date: startDate,
        end_date: endDate,
        owner: owner.trim() || null,
        memo: memo.trim() || null,
        revenue: revenue ? Number(revenue) : null,
        roas: roas ? Number(roas) : null,
      }

      const { error } = await supabase
        .from('exhibitions')
        .update(payload)
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
        <h1 className="ui-page-title">기획전 수정</h1>
        <p className="ui-page-subtitle">
          기존 기획전 정보를 수정할 수 있어요.
        </p>
      </div>

      <div className="ui-card p-5 md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="ui-label">기획전명</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="ui-input"
              placeholder="기획전명"
            />
          </div>

          <div>
            <label className="ui-label">플랫폼</label>
            <div className="ui-select-wrap">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="ui-select"
              >
                <option value="29CM">29CM</option>
                <option value="무신사">무신사</option>
                <option value="자사몰">자사몰</option>
                <option value="지그재그">지그재그</option>
                <option value="W컨셉">W컨셉</option>
              </select>
            </div>
          </div>

          <div>
            <label className="ui-label">상태</label>
            <div className="ui-select-wrap">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="ui-select"
              >
                <option value="예정">예정</option>
                <option value="준비중">준비중</option>
                <option value="진행중">진행중</option>
                <option value="종료">종료</option>
              </select>
            </div>
          </div>

          <div>
            <label className="ui-label">시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="ui-input"
            />
          </div>

          <div>
            <label className="ui-label">종료일</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="ui-input"
            />
          </div>

          <div>
            <label className="ui-label">담당자</label>
            <input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="ui-input"
              placeholder="담당자"
            />
          </div>

          <div>
            <label className="ui-label">매출 (원)</label>
            <input
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              className="ui-input"
              placeholder="예: 1200000"
              inputMode="numeric"
            />
          </div>

          <div>
            <label className="ui-label">ROAS (%)</label>
            <input
              value={roas}
              onChange={(e) => setRoas(e.target.value)}
              className="ui-input"
              placeholder="예: 350"
              inputMode="decimal"
            />
          </div>

          <div className="md:col-span-2">
            <label className="ui-label">메모</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="ui-textarea"
              placeholder="메모"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={() => router.push(`/exhibitions/${id}`)}
            className="ui-btn"
          >
            취소
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="ui-btn ui-btn-primary"
          >
            {saving ? '저장 중...' : '수정 저장'}
          </button>
        </div>
      </div>
    </div>
  )
}