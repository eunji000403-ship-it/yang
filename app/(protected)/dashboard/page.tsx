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

type BoardPost = {
  id: string
  title: string
  category?: string
  created_at?: string
}

export default function DashboardPage() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [{ data: exhibitionData }, { data: postData }] = await Promise.all([
        supabase.from('exhibitions').select('*').order('id', { ascending: false }),
        supabase.from('board_posts').select('*').order('id', { ascending: false }).limit(5),
      ])

      setExhibitions((exhibitionData as Exhibition[]) || [])
      setPosts((postData as BoardPost[]) || [])
      setLoading(false)
    }

    load()
  }, [])

  const summary = useMemo(() => {
    const ongoing = exhibitions.filter((item) => item.status === '진행중').length
    const upcoming = exhibitions.filter((item) => item.status === '예정').length
    const preparing = exhibitions.filter((item) => item.status === '준비중').length
    const ended = exhibitions.filter((item) => item.status === '종료').length

    return {
      total: exhibitions.length,
      ongoing,
      upcoming,
      preparing,
      ended,
    }
  }, [exhibitions])

  if (loading) {
    return <div className="p-4 text-sm text-[#8b95a1] md:p-8">대시보드 불러오는 중...</div>
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <div>
        <h1 className="text-[20px] font-bold text-[#111111] md:text-[22px]">
          대시보드
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">ILANG internal workspace</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-5">
          <p className="text-sm text-[#6b7280]">진행 중 기획전</p>
          <p className="mt-3 text-2xl font-bold text-[#111111]">{summary.ongoing}</p>
          <p className="mt-2 text-sm text-[#6b7280]">현재 상태 기준</p>
        </div>

        <div className="rounded-lg border border-[#e5e7eb] bg-white p-5">
          <p className="text-sm text-[#6b7280]">예정 기획전</p>
          <p className="mt-3 text-2xl font-bold text-[#111111]">{summary.upcoming}</p>
          <p className="mt-2 text-sm text-[#6b7280]">오픈 대기 중</p>
        </div>

        <div className="rounded-lg border border-[#e5e7eb] bg-white p-5">
          <p className="text-sm text-[#6b7280]">준비 중 기획전</p>
          <p className="mt-3 text-2xl font-bold text-[#111111]">{summary.preparing}</p>
          <p className="mt-2 text-sm text-[#6b7280]">세팅 필요</p>
        </div>

        <div className="rounded-lg border border-[#e5e7eb] bg-white p-5">
          <p className="text-sm text-[#6b7280]">종료 기획전</p>
          <p className="mt-3 text-2xl font-bold text-[#111111]">{summary.ended}</p>
          <p className="mt-2 text-sm text-[#6b7280]">종료 처리 기준</p>
        </div>
      </div>

      {/* 빠른 메뉴 + 운영 요약 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[#111111]">빠른 메뉴</h2>
            <p className="mt-1 text-sm text-[#6b7280]">자주 쓰는 기능으로 바로 이동</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/exhibitions/create"
              className="rounded-lg border border-[#e5e7eb] p-4 transition hover:bg-[#fafafa]"
            >
              <p className="text-sm font-semibold text-[#111111]">기획전 등록</p>
              <p className="mt-1 text-sm text-[#6b7280]">새 일정 추가</p>
            </Link>

            <Link
              href="/calendar"
              className="rounded-lg border border-[#e5e7eb] p-4 transition hover:bg-[#fafafa]"
            >
              <p className="text-sm font-semibold text-[#111111]">캘린더 보기</p>
              <p className="mt-1 text-sm text-[#6b7280]">일정 확인</p>
            </Link>

            <Link
              href="/sales"
              className="rounded-lg border border-[#e5e7eb] p-4 transition hover:bg-[#fafafa]"
            >
              <p className="text-sm font-semibold text-[#111111]">매출 관리</p>
              <p className="mt-1 text-sm text-[#6b7280]">성과 확인</p>
            </Link>

            <Link
              href="/board"
              className="rounded-lg border border-[#e5e7eb] p-4 transition hover:bg-[#fafafa]"
            >
              <p className="text-sm font-semibold text-[#111111]">게시판</p>
              <p className="mt-1 text-sm text-[#6b7280]">업무 공유</p>
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-[#e5e7eb] bg-white p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[#111111]">운영 요약</h2>
            <p className="mt-1 text-sm text-[#6b7280]">지금 기준 전체 운영 상태</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-[#fafafa] px-4 py-3">
              <span className="text-sm text-[#6b7280]">전체 기획전</span>
              <span className="text-base font-semibold text-[#111111]">{summary.total}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-[#fafafa] px-4 py-3">
              <span className="text-sm text-[#6b7280]">진행중</span>
              <span className="text-base font-semibold text-[#111111]">{summary.ongoing}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-[#fafafa] px-4 py-3">
              <span className="text-sm text-[#6b7280]">예정</span>
              <span className="text-base font-semibold text-[#111111]">{summary.upcoming}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-[#fafafa] px-4 py-3">
              <span className="text-sm text-[#6b7280]">준비중</span>
              <span className="text-base font-semibold text-[#111111]">{summary.preparing}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 최근 등록된 기획전 */}
      <div className="rounded-lg border border-[#e5e7eb] bg-white p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-[#111111]">최근 등록된 기획전</h2>
          <p className="mt-1 text-sm text-[#6b7280]">
            기획전 관리 페이지에 등록된 최근 일정입니다.
          </p>
        </div>

        <div className="space-y-3">
          {exhibitions.slice(0, 5).map((item) => (
            <Link
              key={item.id}
              href={`/exhibitions/${item.id}`}
              className="block rounded-lg border border-[#e5e7eb] p-4 transition hover:bg-[#fafafa]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#111111]">{item.platform}</p>
                  <p className="mt-1 text-base font-bold text-[#111111]">{item.title}</p>
                  <p className="mt-1 text-sm text-[#6b7280]">
                    {item.start_date && item.end_date
                      ? `${item.start_date} ~ ${item.end_date}`
                      : '일정 미입력'}
                  </p>
                </div>

                <span className="inline-flex w-fit rounded-md bg-[#f5f5f5] px-2.5 py-1 text-xs font-medium text-[#374151]">
                  {item.status}
                </span>
              </div>
            </Link>
          ))}

          {exhibitions.length === 0 && (
            <div className="rounded-lg border border-dashed border-[#e5e7eb] p-8 text-center text-sm text-[#9ca3af]">
              등록된 기획전이 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 최근 게시글 */}
      <div className="rounded-lg border border-[#e5e7eb] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#111111]">최근 게시글</h2>
            <p className="mt-1 text-sm text-[#6b7280]">최근 공유된 업무 게시글</p>
          </div>

          <Link
            href="/board"
            className="text-sm font-medium text-[#111111] hover:underline"
          >
            전체 보기
          </Link>
        </div>

        <div className="space-y-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/board/${post.id}`}
              className="block rounded-lg border border-[#e5e7eb] p-4 transition hover:bg-[#fafafa]"
            >
              <p className="truncate text-sm font-semibold text-[#111111]">{post.title}</p>
              <p className="mt-1 text-sm text-[#6b7280]">{post.category || '게시글'}</p>
            </Link>
          ))}

          {posts.length === 0 && (
            <div className="rounded-lg border border-dashed border-[#e5e7eb] p-8 text-center text-sm text-[#9ca3af]">
              게시글이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}