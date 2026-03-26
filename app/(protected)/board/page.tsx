'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type BoardPost = {
  id: string
  title: string
  category?: string | null
  author?: string | null
  created_at?: string | null
}

const CATEGORY_FILTERS = ['전체', '공지', '업무공유', '기획전', '기타']

function formatDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

export default function BoardPage() {
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('전체')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadPosts = async () => {
      const { data, error } = await supabase
        .from('board_posts')
        .select('id, title, category, author, created_at')
        .order('id', { ascending: false })

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      setPosts((data as BoardPost[]) || [])
      setLoading(false)
    }

    loadPosts()
  }, [])

  const filteredPosts = useMemo(() => {
    let result = [...posts]

    if (activeFilter !== '전체') {
      result = result.filter((item) => (item.category || '기타') === activeFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.category || '').toLowerCase().includes(q) ||
          (item.author || '').toLowerCase().includes(q)
      )
    }

    return result
  }, [posts, activeFilter, search])

  if (loading) {
    return <div className="p-4 text-sm text-[#8b95a1] md:p-8">게시판 불러오는 중...</div>
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <div>
        <h1 className="text-[20px] font-bold text-[#111111] md:text-[22px]">
          게시판
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          공지, 업무 공유, 메모를 한 곳에서 관리해요.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveFilter(item)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                activeFilter === item
                  ? 'bg-black text-white'
                  : 'bg-[#f5f5f5] text-[#6b7280]'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <Link
          href="/board/write"
          className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937]"
        >
          + 글쓰기
        </Link>
      </div>

      <div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="제목, 작성자, 카테고리 검색"
          className="w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm text-[#111111] outline-none focus:border-black"
        />
      </div>

      <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#111111]">게시글 목록</h2>
            <p className="mt-1 text-sm text-[#6b7280]">
              총 {filteredPosts.length}개의 게시글
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/board/${post.id}`}
              className="block rounded-lg border border-[#e5e7eb] p-4 transition hover:bg-[#fafafa]"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className="rounded-md bg-[#f5f5f5] px-2.5 py-1 text-xs font-medium text-[#4b5563]">
                      {post.category || '기타'}
                    </span>
                  </div>

                  <p className="break-words text-sm font-semibold text-[#111111] md:text-base">
                    {post.title}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#6b7280]">
                    <span>{post.author || '작성자 미입력'}</span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </div>

                <div className="shrink-0 text-sm font-medium text-[#111111]">
                  보기
                </div>
              </div>
            </Link>
          ))}

          {filteredPosts.length === 0 && (
            <div className="rounded-lg border border-dashed border-[#e5e7eb] p-8 text-center text-sm text-[#9ca3af]">
              게시글이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}