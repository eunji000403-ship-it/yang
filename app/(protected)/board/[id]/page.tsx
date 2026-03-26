'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type BoardPost = {
  id: string
  title: string
  category?: string | null
  author?: string | null
  content?: string | null
  created_at?: string | null
}

type Attachment = {
  id: string
  file_name?: string | null
  file_url?: string | null
}

type Comment = {
  id: string
  author?: string | null
  content?: string | null
  created_at?: string | null
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

export default function BoardDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [post, setPost] = useState<BoardPost | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingComment, setSavingComment] = useState(false)

  useEffect(() => {
    const load = async () => {
      const [{ data: postData }, { data: attachmentData }, { data: commentData }] =
        await Promise.all([
          supabase.from('board_posts').select('*').eq('id', id).single(),
          supabase
            .from('board_attachments')
            .select('*')
            .eq('post_id', id)
            .order('id', { ascending: false }),
          supabase
            .from('board_comments')
            .select('*')
            .eq('post_id', id)
            .order('id', { ascending: false }),
        ])

      setPost((postData as BoardPost) || null)
      setAttachments((attachmentData as Attachment[]) || [])
      setComments((commentData as Comment[]) || [])
      setLoading(false)
    }

    if (id) load()
  }, [id])

  const categoryLabel = useMemo(() => {
    return post?.category || '기타'
  }, [post])

  const handleCreateComment = async () => {
    if (!commentText.trim()) return

    setSavingComment(true)

    const { error } = await supabase.from('board_comments').insert({
      post_id: id,
      author: '관리자',
      content: commentText.trim(),
    })

    if (error) {
      alert('댓글 등록에 실패했어요.')
      setSavingComment(false)
      return
    }

    const { data } = await supabase
      .from('board_comments')
      .select('*')
      .eq('post_id', id)
      .order('id', { ascending: false })

    setComments((data as Comment[]) || [])
    setCommentText('')
    setSavingComment(false)
  }

  if (loading) {
    return <div className="p-4 text-sm text-[#8b95a1] md:p-8">게시글 불러오는 중...</div>
  }

  if (!post) {
    return (
      <div className="rounded-lg border border-dashed border-[#e5e7eb] p-8 text-center text-sm text-[#9ca3af]">
        게시글을 찾을 수 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-md bg-[#f5f5f5] px-2.5 py-1 text-xs font-medium text-[#4b5563]">
              {categoryLabel}
            </span>
          </div>

          <h1 className="break-words text-[22px] font-bold leading-tight text-[#111111] md:text-[28px]">
            {post.title}
          </h1>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#6b7280]">
            <span>작성자: {post.author || '미입력'}</span>
            <span>등록일: {formatDate(post.created_at)}</span>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => router.push('/board')}
            className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-medium text-[#374151]"
          >
            목록
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-[#e5e7eb] bg-white p-5 md:p-6">
        <h2 className="mb-4 text-base font-semibold text-[#111111]">본문</h2>
        <div className="whitespace-pre-wrap break-words text-[15px] leading-7 text-[#374151]">
          {post.content || '내용이 없습니다.'}
        </div>
      </div>

      <div className="rounded-lg border border-[#e5e7eb] bg-white p-5 md:p-6">
        <h2 className="mb-4 text-base font-semibold text-[#111111]">첨부파일</h2>

        <div className="space-y-3">
          {attachments.length > 0 ? (
            attachments.map((file) => (
              <a
                key={file.id}
                href={file.file_url || '#'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg border border-[#e5e7eb] p-4 transition hover:bg-[#fafafa]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#111111]">
                    {file.file_name || '첨부파일'}
                  </p>
                  <p className="mt-1 text-xs text-[#9ca3af]">새 창에서 열기</p>
                </div>
                <span className="shrink-0 text-sm font-medium text-[#111111]">열기</span>
              </a>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-[#e5e7eb] p-6 text-center text-sm text-[#9ca3af]">
              첨부파일이 없습니다.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-[#e5e7eb] bg-white p-5 md:p-6">
        <h2 className="mb-4 text-base font-semibold text-[#111111]">댓글</h2>

        <div className="space-y-3">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="댓글을 입력하세요"
            className="min-h-[120px] w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm text-[#111111] outline-none focus:border-black"
          />

          <div className="flex justify-end">
            <button
              onClick={handleCreateComment}
              disabled={savingComment}
              className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {savingComment ? '등록 중...' : '댓글 등록'}
            </button>
          </div>

          <div className="pt-2 space-y-3">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border border-[#e5e7eb] p-4"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="font-semibold text-[#111111]">
                      {comment.author || '익명'}
                    </span>
                    <span className="text-[#9ca3af]">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>

                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#4b5563]">
                    {comment.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-[#e5e7eb] p-6 text-center text-sm text-[#9ca3af]">
                댓글이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          onClick={() => router.push('/board')}
          className="rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm font-medium text-[#374151]"
        >
          목록으로
        </button>

        <button
          onClick={() => router.push(`/board/write?id=${post.id}`)}
          className="rounded-lg bg-black px-4 py-3 text-sm font-medium text-white"
        >
          수정하기
        </button>
      </div>
    </div>
  )
}