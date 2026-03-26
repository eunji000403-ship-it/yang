'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CreateExhibitionPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState('29CM')
  const [status, setStatus] = useState('예정')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [owner, setOwner] = useState('')
  const [memo, setMemo] = useState('')
  const [saving, setSaving] = useState(false)

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
      }

      const { data, error } = await supabase
        .from('exhibitions')
        .insert(payload)
        .select()
        .single()

      if (error || !data) {
        console.error('exhibition insert error:', error)
        alert(error?.message || '기획전 등록에 실패했어요.')
        setSaving(false)
        return
      }

      setSaving(false)
      alert('기획전 등록 완료!')
      router.push(`/exhibitions/${data.id}`)
    } catch (error) {
      console.error('exhibition unexpected error:', error)
      alert('등록 중 오류가 발생했어요.')
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="ui-page-title">기획전 등록</h1>
        <p className="ui-page-subtitle">
          새 기획전을 등록하면 목록과 캘린더에 연결돼요.
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
              placeholder="예: W컨셉 여름 기획전"
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
              placeholder="예: 은지"
            />
          </div>

          <div className="md:col-span-2">
            <label className="ui-label">메모</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="ui-textarea"
              placeholder="추가 메모를 입력하세요"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={() => router.push('/exhibitions')}
            className="ui-btn"
          >
            취소
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="ui-btn ui-btn-primary"
          >
            {saving ? '저장 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  )
}