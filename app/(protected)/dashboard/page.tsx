'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Exhibition = {
  id: string
  title: string
  platform: string
  status: string
  start_date: string
  end_date: string
  owner: string | null
  participation_status: string | null
  discount: string | null
  memo: string | null
}

type Sales = {
  id: string
  exhibition_id: string
  revenue: number
  order_count: number
  status: string
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-[#e9edf0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {children}
    </div>
  )
}

function SectionHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[#191f28]">{title}</h2>
      <p className="mt-1 text-sm text-[#8b95a1]">{description}</p>
    </div>
  )
}

function StatCard({
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

function ScheduleItem({
  id,
  platform,
  title,
  date,
  status,
}: {
  id: string
  platform: string
  title: string
  date: string
  status: string
}) {
  return (
    <Link
      href={`/exhibitions/${id}`}
      className="flex items-center justify-between rounded-2xl border border-[#eef0f3] px-4 py-4 transition hover:bg-[#fafbfc]"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8b95a1]">
          {platform}
        </p>
        <h3 className="mt-1 font-semibold text-[#191f28]">{title}</h3>
        <p className="mt-1 text-sm text-[#6b7684]">{date}</p>
      </div>

      <span className="rounded-full bg-[#f2f4f6] px-3 py-1 text-sm font-medium text-[#4e5968]">
        {status}
      </span>
    </Link>
  )
}

function QuickMenu({
  href,
  title,
  desc,
}: {
  href: string
  title: string
  desc: string
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-[#eef0f3] bg-[#fbfcfd] p-4 text-left transition hover:bg-[#f7f8fa]"
    >
      <p className="font-semibold text-[#191f28]">{title}</p>
      <p className="mt-1 text-sm text-[#8b95a1]">{desc}</p>
    </Link>
  )
}

function TodoItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#eef0f3] px-4 py-3">
      <div className="h-5 w-5 rounded-full border border-[#d1d6db] bg-white" />
      <p className="text-sm text-[#333d4b]">{text}</p>
    </div>
  )
}

export default function DashboardPage() {
  const [items, setItems] = useState<Exhibition[]>([])
  const [sales, setSales] = useState<Sales[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    const [
      { data: exhibitionData, error: exhibitionError },
      { data: salesData, error: salesError },
    ] = await Promise.all([
      supabase
        .from('exhibitions')
        .select('*')
        .order('start_date', { ascending: true }),
      supabase
        .from('sales')
        .select('*'),
    ])

    if (exhibitionError || salesError) {
      console.error(exhibitionError || salesError)
      setLoading(false)
      return
    }

    setItems((exhibitionData as Exhibition[]) || [])
    setSales((salesData as Sales[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const ongoingCount = items.filter((item) => item.status === '진행중').length
  const upcomingCount = items.filter((item) => item.status === '예정').length
  const pendingCount = items.filter((item) => item.status === '준비중').length
  const completeCount = items.filter((item) => item.status === '종료').length

  const latestItems = [...items].slice(0, 4)

  const totalRevenue = sales.reduce(
    (sum, item) => sum + Number(item.revenue || 0),
    0
  )

  const avgRevenue =
    sales.length > 0 ? Math.round(totalRevenue / sales.length) : 0

  const completedSalesCount = sales.filter(
    (item) => item.status === '완료'
  ).length

  const topSales = [...sales].sort(
    (a, b) => Number(b.revenue) - Number(a.revenue)
  )[0]

  const topExhibition = items.find(
    (item) => item.id === topSales?.exhibition_id
  )

  return (
    <div>
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="진행 중 기획전" value={String(ongoingCount)} sub="현재 상태 기준" />
        <StatCard title="예정 기획전" value={String(upcomingCount)} sub="오픈 대기 중" />
        <StatCard title="준비 중 기획전" value={String(pendingCount)} sub="세팅 필요" />
        <StatCard title="종료 기획전" value={String(completeCount)} sub="종료 처리 기준" />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="총 매출"
          value={`₩${totalRevenue.toLocaleString()}`}
          sub="전체 기획전 기준"
        />
        <StatCard
          title="평균 매출"
          value={`₩${avgRevenue.toLocaleString()}`}
          sub="입력된 매출 평균"
        />
        <StatCard
          title="매출 입력 완료"
          value={`${completedSalesCount}건`}
          sub="완료 상태 기준"
        />
        <StatCard
          title="최고 매출"
          value={topExhibition?.title || '-'}
          sub={
            topSales
              ? `₩${Number(topSales.revenue).toLocaleString()}`
              : '-'
          }
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Card>
            <SectionHeader
              title="최근 등록된 기획전"
              description="기획전 관리 페이지에 등록된 최근 일정입니다."
            />

            <div className="mt-5 space-y-3">
              {loading ? (
                <p className="text-sm text-[#8b95a1]">불러오는 중...</p>
              ) : latestItems.length === 0 ? (
                <p className="text-sm text-[#8b95a1]">등록된 기획전이 없어.</p>
              ) : (
                latestItems.map((item) => (
                  <ScheduleItem
                    key={item.id}
                    id={item.id}
                    platform={item.platform}
                    title={item.title}
                    date={`${item.start_date} ~ ${item.end_date}`}
                    status={item.status}
                  />
                ))
              )}
            </div>
          </Card>

          <Card>
            <SectionHeader
              title="운영 메모"
              description="대시보드 기준으로 빠르게 체크할 항목입니다."
            />

            <div className="mt-5 space-y-3">
              <TodoItem text="진행중 기획전 상태 점검" />
              <TodoItem text="예정 기획전 시작일 재확인" />
              <TodoItem text="종료 기획전 매출 입력 준비" />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <SectionHeader
              title="빠른 메뉴"
              description="자주 쓰는 기능으로 바로 이동"
            />

            <div className="mt-5 grid grid-cols-2 gap-3">
              <QuickMenu href="/exhibitions" title="기획전 등록" desc="새 일정 추가" />
              <QuickMenu href="/calendar" title="캘린더 보기" desc="일정 확인" />
              <QuickMenu href="/sales" title="매출 관리" desc="성과 확인" />
              <QuickMenu href="/board" title="게시판" desc="업무 공유" />
            </div>
          </Card>

          <Card>
            <SectionHeader
              title="운영 요약"
              description="지금 기준 전체 운영 상태"
            />

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-[#f7f8fa] px-4 py-3">
                <span className="text-sm text-[#4e5968]">전체 기획전</span>
                <span className="text-sm font-semibold text-[#191f28]">{items.length}건</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#f7f8fa] px-4 py-3">
                <span className="text-sm text-[#4e5968]">진행중 + 예정</span>
                <span className="text-sm font-semibold text-[#191f28]">
                  {ongoingCount + upcomingCount}건
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#f7f8fa] px-4 py-3">
                <span className="text-sm text-[#4e5968]">캘린더 반영 대상</span>
                <span className="text-sm font-semibold text-[#191f28]">{items.length}건</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#f7f8fa] px-4 py-3">
                <span className="text-sm text-[#4e5968]">매출 입력 건수</span>
                <span className="text-sm font-semibold text-[#191f28]">{sales.length}건</span>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}