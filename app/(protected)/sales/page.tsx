'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Exhibition = {
  id: string
  title: string
  platform: string
  start_date: string
  end_date: string
}

type SalesRow = {
  id: string
  exhibition_id: string
  revenue: number
  order_count: number
  status: string
  memo: string | null
}

type JoinedSalesItem = {
  id: string
  exhibition_id: string
  exhibition_title: string
  platform: string
  start_date: string
  end_date: string
  revenue: number
  order_count: number
  status: string
  memo: string | null
}

function SummaryCard({
  title,
  value,
  sub,
}: {
  title: string
  value: string
  sub: string
}) {
  return (
    <div className="rounded-3xl border border-[#e9edf0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <p className="text-sm font-medium text-[#8b95a1]">{title}</p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-[#191f28]">{value}</p>
      <p className="mt-2 text-sm text-[#6b7684]">{sub}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styleMap: Record<string, string> = {
    집계중: 'bg-[#fff6e8] text-[#b7791f]',
    완료: 'bg-[#e8f7ee] text-[#168a57]',
    미입력: 'bg-[#f2f4f6] text-[#6b7684]',
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styleMap[status] ?? 'bg-[#f2f4f6] text-[#6b7684]'
      }`}
    >
      {status}
    </span>
  )
}

function InsightCard({
  title,
  value,
  desc,
}: {
  title: string
  value: string
  desc: string
}) {
  return (
    <div className="rounded-3xl border border-[#e9edf0] bg-white p-5">
      <p className="text-sm font-medium text-[#8b95a1]">{title}</p>
      <p className="mt-3 text-xl font-bold text-[#191f28]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[#6b7684]">{desc}</p>
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value)
}

export default function SalesPage() {
  const [salesItems, setSalesItems] = useState<JoinedSalesItem[]>([])
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState('전체')
  const [isOpen, setIsOpen] = useState(false)

  const [selectedExhibitionId, setSelectedExhibitionId] = useState('')
  const [revenue, setRevenue] = useState('')
  const [orderCount, setOrderCount] = useState('')
  const [status, setStatus] = useState('미입력')
  const [memo, setMemo] = useState('')

  const loadData = async () => {
    const [{ data: exhibitionData, error: exhibitionError }, { data: salesData, error: salesError }] =
      await Promise.all([
        supabase
          .from('exhibitions')
          .select('id, title, platform, start_date, end_date')
          .order('start_date', { ascending: true }),
        supabase
          .from('sales')
          .select('*')
          .order('created_at', { ascending: false }),
      ])

    if (exhibitionError || salesError) {
      console.error(exhibitionError || salesError)
      setLoading(false)
      return
    }

    const exhibitionList = (exhibitionData as Exhibition[]) || []
    const salesList = (salesData as SalesRow[]) || []

    const joined: JoinedSalesItem[] = salesList.map((sales) => {
      const exhibition = exhibitionList.find((item) => item.id === sales.exhibition_id)

      return {
        id: sales.id,
        exhibition_id: sales.exhibition_id,
        exhibition_title: exhibition?.title || '알 수 없는 기획전',
        platform: exhibition?.platform || '-',
        start_date: exhibition?.start_date || '-',
        end_date: exhibition?.end_date || '-',
        revenue: Number(sales.revenue || 0),
        order_count: Number(sales.order_count || 0),
        status: sales.status,
        memo: sales.memo,
      }
    })

    setExhibitions(exhibitionList)
    setSalesItems(joined)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const resetForm = () => {
    setSelectedExhibitionId('')
    setRevenue('')
    setOrderCount('')
    setStatus('미입력')
    setMemo('')
  }

  const handleCreate = async () => {
    if (!selectedExhibitionId) {
      alert('기획전을 선택해줘.')
      return
    }

    const revenueNumber = Number(revenue || 0)
    const orderNumber = Number(orderCount || 0)

    const { error } = await supabase.from('sales').insert({
      exhibition_id: selectedExhibitionId,
      revenue: revenueNumber,
      order_count: orderNumber,
      status,
      memo: memo || null,
    })

    if (error) {
      alert(`매출 입력 실패: ${error.message}`)
      return
    }

    alert('매출 입력 완료!')
    setIsOpen(false)
    resetForm()
    await loadData()
  }

  const filteredItems = useMemo(() => {
    if (selectedPlatform === '전체') return salesItems
    return salesItems.filter((item) => item.platform === selectedPlatform)
  }, [salesItems, selectedPlatform])

  const totalRevenue = filteredItems.reduce((sum, item) => sum + item.revenue, 0)
  const completeCount = filteredItems.filter((item) => item.status === '완료').length
  const pendingCount = exhibitions.length - salesItems.length
  const averageRevenue =
    filteredItems.length > 0 ? Math.round(totalRevenue / filteredItems.length) : 0

  const topItem =
    filteredItems.length > 0
      ? [...filteredItems].sort((a, b) => b.revenue - a.revenue)[0]
      : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        

        <div className="flex flex-wrap gap-2">
          {['전체', '29CM', '무신사', '자사몰', '지그재그'].map((item) => (
            <button
              key={item}
              onClick={() => setSelectedPlatform(item)}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                selectedPlatform === item
                  ? 'bg-[#191f28] text-white'
                  : 'border border-[#e5e8eb] bg-white text-[#4e5968] hover:bg-[#f7f8fa]'
              }`}
            >
              {item}
            </button>
          ))}
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-2xl bg-[#191f28] px-4 py-2 text-sm font-medium text-white"
          >
            매출 입력
          </button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="총매출"
          value={`₩${formatCurrency(totalRevenue)}`}
          sub="현재 필터 기준"
        />
        <SummaryCard
          title="입력 완료"
          value={`${completeCount}건`}
          sub="완료 상태 기준"
        />
        <SummaryCard
          title="평균 매출"
          value={`₩${formatCurrency(averageRevenue)}`}
          sub="입력된 매출 평균"
        />
        <SummaryCard
          title="미입력 기획전"
          value={`${pendingCount}건`}
          sub="기획전 대비 미입력"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="overflow-hidden rounded-3xl border border-[#e9edf0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="border-b border-[#eef0f3] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#191f28]">기획전별 매출 현황</h2>
            <p className="mt-1 text-sm text-[#8b95a1]">
              입력된 매출 데이터를 기획전 기준으로 정리합니다.
            </p>
          </div>

          <div className="grid grid-cols-[1.2fr_0.7fr_0.8fr_0.8fr_0.7fr_0.6fr] bg-[#fbfcfd] px-5 py-3 text-sm font-semibold text-[#6b7684]">
            <div>기획전명</div>
            <div>플랫폼</div>
            <div>기간</div>
            <div>매출</div>
            <div>주문수</div>
            <div>상태</div>
          </div>

          {loading ? (
            <div className="px-5 py-8 text-sm text-[#8b95a1]">불러오는 중...</div>
          ) : filteredItems.length === 0 ? (
            <div className="px-5 py-8 text-sm text-[#8b95a1]">입력된 매출 데이터가 없어.</div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1.2fr_0.7fr_0.8fr_0.8fr_0.7fr_0.6fr] items-center border-t border-[#eef0f3] px-5 py-4 text-sm text-[#333d4b]"
              >
                <div className="font-medium text-[#191f28]">{item.exhibition_title}</div>
                <div>{item.platform}</div>
                <div>
                  {item.start_date} ~ {item.end_date}
                </div>
                <div className="font-semibold text-[#191f28]">
                  ₩{formatCurrency(item.revenue)}
                </div>
                <div>{item.order_count}건</div>
                <div>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <InsightCard
            title="최고 매출 기획전"
            value={topItem ? topItem.exhibition_title : '-'}
            desc={
              topItem
                ? `${topItem.platform} 채널에서 ₩${formatCurrency(topItem.revenue)} 기록`
                : '아직 매출 데이터가 없습니다.'
            }
          />
          <InsightCard
            title="현재 총 기획전 수"
            value={`${exhibitions.length}건`}
            desc="기획전 관리에 등록된 전체 기획전 수 기준입니다."
          />
          <InsightCard
            title="매출 입력 필요"
            value={`${pendingCount}건`}
            desc="기획전은 등록됐지만 아직 매출 데이터가 없는 항목입니다."
          />

          <div className="rounded-3xl border border-[#e9edf0] bg-white p-5">
            <h2 className="text-lg font-semibold text-[#191f28]">운영 메모</h2>
            <div className="mt-3 space-y-2 text-sm leading-6 text-[#6b7684]">
              <p>• 종료된 기획전은 매출 입력을 꼭 진행하세요.</p>
              <p>• 추후 기획전 상세 페이지와 직접 연결할 수 있어요.</p>
              <p>• 다음 단계에서 수정/삭제 기능도 붙일 수 있어요.</p>
            </div>
          </div>
        </div>
      </section>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#191f28]">매출 입력</h3>
                <p className="mt-1 text-sm text-[#8b95a1]">
                  기획전과 연결된 매출 데이터를 입력하세요.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false)
                  resetForm()
                }}
                className="rounded-xl border border-[#e5e8eb] px-3 py-2 text-sm text-[#6b7684]"
              >
                닫기
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#4e5968]">
                  기획전 선택
                </label>
                <select
                  value={selectedExhibitionId}
                  onChange={(e) => setSelectedExhibitionId(e.target.value)}
                  className="w-full rounded-2xl border border-[#e5e8eb] px-4 py-3 text-sm outline-none focus:border-[#191f28]"
                >
                  <option value="">기획전을 선택하세요</option>
                  {exhibitions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} ({item.platform})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4e5968]">
                    매출
                  </label>
                  <input
                    type="number"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    className="w-full rounded-2xl border border-[#e5e8eb] px-4 py-3 text-sm outline-none focus:border-[#191f28]"
                    placeholder="예: 2340000"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4e5968]">
                    주문수
                  </label>
                  <input
                    type="number"
                    value={orderCount}
                    onChange={(e) => setOrderCount(e.target.value)}
                    className="w-full rounded-2xl border border-[#e5e8eb] px-4 py-3 text-sm outline-none focus:border-[#191f28]"
                    placeholder="예: 128"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#4e5968]">
                  상태
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-2xl border border-[#e5e8eb] px-4 py-3 text-sm outline-none focus:border-[#191f28]"
                >
                  <option value="미입력">미입력</option>
                  <option value="집계중">집계중</option>
                  <option value="완료">완료</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#4e5968]">
                  메모
                </label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-[#e5e8eb] px-4 py-3 text-sm outline-none focus:border-[#191f28]"
                  placeholder="정산 메모를 입력하세요."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleCreate}
                className="flex-1 rounded-2xl bg-[#191f28] px-4 py-3 text-sm font-semibold text-white"
              >
                저장
              </button>
              <button
                onClick={() => {
                  setIsOpen(false)
                  resetForm()
                }}
                className="flex-1 rounded-2xl border border-[#e5e8eb] bg-white px-4 py-3 text-sm font-semibold text-[#4e5968]"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}