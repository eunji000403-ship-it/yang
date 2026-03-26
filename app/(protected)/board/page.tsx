'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type PostItem = {
  id: string
  title: string
  content: string
  category: string
  author: string
  created_at: string
  updated_at: string
}

type ReadItem = {
  id: string
  post_id: string
  user_email: string
  acknowledged: boolean
  read_at: string
}

function CategoryButton({
  label,
  active = false,
  onClick,
}: {
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
        active
          ? 'bg-[#191f28] text-white'
          : 'border border-[#e5e8eb] bg-white text-[#4e5968] hover:bg-[#f7f8fa]'
      }`}
    >
      {label}
    </button>
  )
}

function CategoryBadge({ label }: { label: string }) {
  const styleMap: Record<string, string> = {
    공지: 'bg-[#fef0f0] text-[#d14343]',
    회의록: 'bg-[#eef7ff] text-[#1976d2]',
    업무공유: 'bg-[#e8f7ee] text-[#168a57]',
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styleMap[label] ?? 'bg-[#f2f4f6] text-[#6b7684]'
      }`}
    >
      {label}
    </span>
  )
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

function SideNoteCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-3xl border border-[#e9edf0] bg-white p-5">
      <h2 className="text-lg font-semibold text-[#191f28]">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-[#6b7684]">{children}</div>
    </div>
  )
}

function formatDate(dateString: string) {
  const d = new Date(dateString)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

export default function BoardPage() {
  const [posts, setPosts] = useState<PostItem[]>([])
  const [reads, setReads] = useState<ReadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserEmail, setCurrentUserEmail] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [keyword, setKeyword] = useState('')

  const loadData = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const email = userData.user?.email || ''
    setCurrentUserEmail(email)

    const [{ data: postData, error: postError }, { data: readData, error: readError }] =
      await Promise.all([
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('post_reads').select('*'),
      ])

    if (postError || readError) {
      console.error(postError || readError)
      setLoading(false)
      return
    }

    setPosts((postData as PostItem[]) || [])
    setReads((readData as ReadItem[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const categoryMatch =
        selectedCategory === '전체' || post.category === selectedCategory

      const keywordMatch =
        keyword.trim() === '' ||
        post.title.toLowerCase().includes(keyword.toLowerCase()) ||
        post.author.toLowerCase().includes(keyword.toLowerCase()) ||
        post.content.toLowerCase().includes(keyword.toLowerCase())

      return categoryMatch && keywordMatch
    })
  }, [posts, selectedCategory, keyword])

  const noticeCount = posts.filter((post) => post.category === '공지').length
  const meetingCount = posts.filter((post) => post.category === '회의록').length
  const shareCount = posts.filter((post) => post.category === '업무공유').length

  const myUnreadCount = posts.filter((post) => {
    if (!currentUserEmail) return false
    const record = reads.find(
      (item) => item.post_id === post.id && item.user_email === currentUserEmail
    )
    return !record
  }).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div className="flex flex-wrap gap-2">
          {['전체', '공지', '회의록', '업무공유'].map((item) => (
            <CategoryButton
              key={item}
              label={item}
              active={selectedCategory === item}
              onClick={() => setSelectedCategory(item)}
            />
          ))}
          <Link
            href="/board/write"
            className="rounded-2xl bg-[#191f28] px-4 py-2 text-sm font-medium text-white"
          >
            글 작성
          </Link>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="전체 게시글" value={String(posts.length)} sub="누적 등록 기준" />
        <SummaryCard title="공지" value={String(noticeCount)} sub="전체 공지 수" />
        <SummaryCard title="회의록" value={String(meetingCount)} sub="회의 기록 수" />
        <SummaryCard title="내 미확인" value={String(myUnreadCount)} sub="읽지 않은 게시글" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="overflow-hidden rounded-3xl border border-[#e9edf0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="border-b border-[#eef0f3] px-6 py-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#191f28]">게시글 목록</h2>
                <p className="mt-1 text-sm text-[#8b95a1]">
                  최근 게시글, 읽음 여부, 분류를 빠르게 볼 수 있어요.
                </p>
              </div>

              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full rounded-2xl border border-[#e5e8eb] bg-[#fbfcfd] px-4 py-3 text-sm outline-none placeholder:text-[#8b95a1] focus:border-[#191f28] md:max-w-xs"
                placeholder="제목, 작성자, 내용으로 검색"
              />
            </div>
          </div>

          <div className="grid grid-cols-[1.6fr_0.7fr_0.7fr_0.7fr_0.7fr] bg-[#fbfcfd] px-5 py-3 text-sm font-semibold text-[#6b7684]">
            <div>제목</div>
            <div>분류</div>
            <div>작성자</div>
            <div>작성일</div>
            <div>내 상태</div>
          </div>

          {loading ? (
            <div className="px-5 py-8 text-sm text-[#8b95a1]">불러오는 중...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="px-5 py-8 text-sm text-[#8b95a1]">등록된 게시글이 없어.</div>
          ) : (
            filteredPosts.map((post) => {
              const myRead = reads.find(
                (item) => item.post_id === post.id && item.user_email === currentUserEmail
              )

              return (
                <Link
                  key={post.id}
                  href={`/board/${post.id}`}
                  className="grid grid-cols-[1.6fr_0.7fr_0.7fr_0.7fr_0.7fr] items-center border-t border-[#eef0f3] px-5 py-4 text-sm text-[#333d4b] transition hover:bg-[#fafbfc]"
                >
                  <div className="font-medium text-[#191f28]">{post.title}</div>
                  <div>
                    <CategoryBadge label={post.category} />
                  </div>
                  <div>{post.author}</div>
                  <div>{formatDate(post.created_at)}</div>
                  <div>
                    <span className="text-xs font-medium text-[#6b7684]">
                      {!myRead ? '미확인' : myRead.acknowledged ? '확인완료' : '읽음'}
                    </span>
                  </div>
                </Link>
              )
            })
          )}
        </div>

        <div className="space-y-4">
          <SideNoteCard title="게시판 운영 메모">
            <p>• 게시글을 열면 자동으로 읽음 처리됩니다.</p>
            <p>• 중요 공지나 회의록은 확인 버튼까지 누르게 운영할 수 있어요.</p>
            <p>• 상세 페이지에서 댓글과 첨부파일을 함께 관리합니다.</p>
          </SideNoteCard>

          <SideNoteCard title="빠른 액션">
            <div className="space-y-3">
              <Link
                href="/board/write"
                className="block w-full rounded-2xl border border-[#e5e8eb] bg-[#fbfcfd] px-4 py-3 text-left text-sm font-medium text-[#191f28] hover:bg-[#f7f8fa]"
              >
                공지 작성하기
              </Link>
              <Link
                href="/board/write"
                className="block w-full rounded-2xl border border-[#e5e8eb] bg-[#fbfcfd] px-4 py-3 text-left text-sm font-medium text-[#191f28] hover:bg-[#f7f8fa]"
              >
                회의록 작성하기
              </Link>
              <Link
                href="/board/write"
                className="block w-full rounded-2xl border border-[#e5e8eb] bg-[#fbfcfd] px-4 py-3 text-left text-sm font-medium text-[#191f28] hover:bg-[#f7f8fa]"
              >
                업무공유 등록하기
              </Link>
            </div>
          </SideNoteCard>

          <SideNoteCard title="운영 요약">
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-2xl bg-[#f7f8fa] px-4 py-3">
                <span>전체 게시글</span>
                <span className="font-semibold text-[#191f28]">{posts.length}건</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#f7f8fa] px-4 py-3">
                <span>읽음 기록 수</span>
                <span className="font-semibold text-[#191f28]">{reads.length}건</span>
              </div>
            </div>
          </SideNoteCard>
        </div>
      </section>
    </div>
  )
}