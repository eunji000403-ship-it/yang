'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

type CommentItem = {
  id: string
  post_id: string
  author: string
  content: string
  created_at: string
}

type ReadItem = {
  id: string
  post_id: string
  user_email: string
  acknowledged: boolean
  read_at: string
}

type PostFileItem = {
  id: string
  post_id: string
  file_name: string
  file_path: string
  file_url: string
  created_at: string
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

function formatDate(dateString: string) {
  if (!dateString) return '-'
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return '-'
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

export default function BoardDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id

  const [post, setPost] = useState<PostItem | null>(null)
  const [comments, setComments] = useState<CommentItem[]>([])
  const [reads, setReads] = useState<ReadItem[]>([])
  const [files, setFiles] = useState<PostFileItem[]>([])
  const [currentUserEmail, setCurrentUserEmail] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [loading, setLoading] = useState(true)

  const [deletingFileId, setDeletingFileId] = useState<string | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentAuthor, setEditingCommentAuthor] = useState('')
  const [editingCommentContent, setEditingCommentContent] = useState('')
  const [savingCommentId, setSavingCommentId] = useState<string | null>(null)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)

  const loadPostDetail = async (postId: string) => {
    const [
      { data: postData, error: postError },
      { data: commentData, error: commentError },
      { data: readData, error: readError },
      { data: fileData, error: fileError },
    ] = await Promise.all([
      supabase.from('posts').select('*').eq('id', postId).single(),
      supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true }),
      supabase.from('post_reads').select('*').eq('post_id', postId),
      supabase
        .from('post_files')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true }),
    ])

    if (postError || !postData) {
      console.error(postError)
      alert('게시글을 불러올 수 없어.')
      router.push('/board')
      return
    }

    if (commentError) console.error(commentError)
    if (readError) console.error(readError)
    if (fileError) console.error(fileError)

    setPost(postData as PostItem)
    setComments((commentData as CommentItem[]) || [])
    setReads((readData as ReadItem[]) || [])
    setFiles((fileData as PostFileItem[]) || [])
  }

  const markAsRead = async (postId: string, email: string) => {
    if (!email) return

    const existing = reads.find(
      (item) => item.post_id === postId && item.user_email === email
    )

    const { error } = await supabase.from('post_reads').upsert(
      {
        post_id: postId,
        user_email: email,
        acknowledged: existing?.acknowledged || false,
        read_at: new Date().toISOString(),
      },
      { onConflict: 'post_id,user_email' }
    )

    if (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (!id) return

    const init = async () => {
      setLoading(true)

      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error(userError)
      }

      const email = userData.user?.email || ''
      setCurrentUserEmail(email)

      if (email) {
        setCommentAuthor(email.split('@')[0])
      }

      await loadPostDetail(id)

      if (email) {
        await markAsRead(id, email)
        await loadPostDetail(id)
      }

      setLoading(false)
    }

    init()
  }, [id])

  const handleAcknowledge = async () => {
    if (!id || !currentUserEmail) return

    const { error } = await supabase.from('post_reads').upsert(
      {
        post_id: id,
        user_email: currentUserEmail,
        acknowledged: true,
        read_at: new Date().toISOString(),
      },
      { onConflict: 'post_id,user_email' }
    )

    if (error) {
      alert(`확인 처리 실패: ${error.message}`)
      return
    }

    alert('확인 완료!')
    await loadPostDetail(id)
  }

  const handleAddComment = async () => {
    if (!id) return

    if (!commentAuthor || !commentContent) {
      alert('댓글 작성자와 내용을 입력해줘.')
      return
    }

    const { error } = await supabase.from('comments').insert({
      post_id: id,
      author: commentAuthor,
      content: commentContent,
    })

    if (error) {
      alert(`댓글 등록 실패: ${error.message}`)
      return
    }

    setCommentContent('')
    await loadPostDetail(id)
  }

  const handleDeletePost = async () => {
    if (!id) return

    const ok = confirm('이 게시글을 삭제할까?')
    if (!ok) return

    const { error } = await supabase.from('posts').delete().eq('id', id)

    if (error) {
      alert(`삭제 실패: ${error.message}`)
      return
    }

    alert('삭제 완료!')
    router.push('/board')
  }

  const handleDeleteFile = async (file: PostFileItem) => {
    const ok = confirm(`"${file.file_name}" 파일을 삭제할까?`)
    if (!ok) return

    setDeletingFileId(file.id)

    const { error: storageError } = await supabase.storage
      .from('board-files')
      .remove([file.file_path])

    if (storageError) {
      setDeletingFileId(null)
      alert(`스토리지 파일 삭제 실패: ${storageError.message}`)
      return
    }

    const { error: dbError } = await supabase
      .from('post_files')
      .delete()
      .eq('id', file.id)

    if (dbError) {
      setDeletingFileId(null)
      alert(`첨부파일 기록 삭제 실패: ${dbError.message}`)
      return
    }

    setDeletingFileId(null)
    await loadPostDetail(id!)
  }

  const startEditComment = (comment: CommentItem) => {
    setEditingCommentId(comment.id)
    setEditingCommentAuthor(comment.author)
    setEditingCommentContent(comment.content)
  }

  const cancelEditComment = () => {
    setEditingCommentId(null)
    setEditingCommentAuthor('')
    setEditingCommentContent('')
  }

  const handleSaveEditedComment = async () => {
    if (!editingCommentId) return

    if (!editingCommentAuthor || !editingCommentContent) {
      alert('댓글 작성자와 내용을 입력해줘.')
      return
    }

    setSavingCommentId(editingCommentId)

    const { error } = await supabase
      .from('comments')
      .update({
        author: editingCommentAuthor,
        content: editingCommentContent,
      })
      .eq('id', editingCommentId)

    if (error) {
      setSavingCommentId(null)
      alert(`댓글 수정 실패: ${error.message}`)
      return
    }

    setSavingCommentId(null)
    cancelEditComment()
    await loadPostDetail(id!)
  }

  const handleDeleteComment = async (commentId: string) => {
    const ok = confirm('이 댓글을 삭제할까?')
    if (!ok) return

    setDeletingCommentId(commentId)

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      setDeletingCommentId(null)
      alert(`댓글 삭제 실패: ${error.message}`)
      return
    }

    setDeletingCommentId(null)

    if (editingCommentId === commentId) {
      cancelEditComment()
    }

    await loadPostDetail(id!)
  }

  const myAck = reads.find(
    (item) => item.user_email === currentUserEmail && item.post_id === id
  )?.acknowledged

  const readUsers = useMemo(() => reads.map((item) => item.user_email), [reads])
  const acknowledgedUsers = useMemo(
    () => reads.filter((item) => item.acknowledged).map((item) => item.user_email),
    [reads]
  )

  if (loading) {
    return <div className="p-8 text-sm text-[#8b95a1]">불러오는 중...</div>
  }

  if (!post) {
    return <div className="p-8 text-sm text-[#8b95a1]">게시글을 찾을 수 없습니다.</div>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/board"
          className="rounded-2xl border border-[#e5e8eb] bg-white px-4 py-2 text-sm font-medium text-[#4e5968] hover:bg-[#f7f8fa]"
        >
          목록으로
        </Link>

        <div className="flex gap-2">
          <Link
            href={`/board/edit/${id}`}
            className="rounded-2xl border border-[#e5e8eb] bg-white px-4 py-2 text-sm font-medium text-[#4e5968] hover:bg-[#f7f8fa]"
          >
            수정
          </Link>
          <button
            onClick={handleDeletePost}
            className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white"
          >
            삭제
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-[#e9edf0] bg-white p-8">
        <div className="mb-3">
          <CategoryBadge label={post.category} />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[#191f28]">
          {post.title}
        </h1>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#8b95a1]">
          <span>작성자: {post.author}</span>
          <span>작성일: {formatDate(post.created_at)}</span>
          <span>수정일: {formatDate(post.updated_at)}</span>
        </div>

        <div className="mt-8 whitespace-pre-wrap rounded-3xl bg-[#fafbfc] p-6 text-[15px] leading-8 text-[#333d4b]">
          {post.content}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#e9edf0] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#191f28]">읽음 현황</h2>

          <div className="mt-4 space-y-2 text-sm text-[#6b7684]">
            <p>읽음: {readUsers.length > 0 ? readUsers.join(', ') : '아직 없음'}</p>
            <p>
              확인완료:{' '}
              {acknowledgedUsers.length > 0 ? acknowledgedUsers.join(', ') : '아직 없음'}
            </p>
          </div>

          <button
            onClick={handleAcknowledge}
            className="mt-5 rounded-2xl bg-[#191f28] px-4 py-3 text-sm font-semibold text-white"
          >
            {myAck ? '확인 완료됨' : '확인했습니다'}
          </button>
        </div>

        <div className="rounded-3xl border border-[#e9edf0] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#191f28]">첨부파일</h2>

          <div className="mt-4 space-y-3">
            {files.length === 0 ? (
              <p className="text-sm text-[#8b95a1]">첨부된 파일이 없습니다.</p>
            ) : (
              files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#eef0f3] bg-[#fafbfc] px-4 py-3"
                >
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 flex-1 truncate text-sm text-[#191f28] hover:underline"
                  >
                    {file.file_name}
                  </a>

                  <button
                    onClick={() => handleDeleteFile(file)}
                    disabled={deletingFileId === file.id}
                    className="shrink-0 rounded-xl bg-red-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {deletingFileId === file.id ? '삭제 중...' : '삭제'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[#e9edf0] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#191f28]">댓글 작성</h2>

        <div className="mt-4 space-y-3">
          <input
            value={commentAuthor}
            onChange={(e) => setCommentAuthor(e.target.value)}
            className="w-full rounded-2xl border border-[#e5e8eb] px-4 py-3 text-sm outline-none focus:border-[#191f28]"
            placeholder="작성자"
          />
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-[#e5e8eb] px-4 py-3 text-sm outline-none focus:border-[#191f28]"
            placeholder="댓글을 입력하세요"
          />
          <button
            onClick={handleAddComment}
            className="rounded-2xl bg-[#191f28] px-4 py-3 text-sm font-semibold text-white"
          >
            댓글 등록
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-[#e9edf0] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#191f28]">댓글 목록</h2>

        <div className="mt-4 space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-[#8b95a1]">등록된 댓글이 없습니다.</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-2xl bg-[#fafbfc] px-4 py-4"
              >
                {editingCommentId === comment.id ? (
                  <div className="space-y-3">
                    <input
                      value={editingCommentAuthor}
                      onChange={(e) => setEditingCommentAuthor(e.target.value)}
                      className="w-full rounded-2xl border border-[#e5e8eb] px-4 py-3 text-sm outline-none focus:border-[#191f28]"
                      placeholder="작성자"
                    />
                    <textarea
                      value={editingCommentContent}
                      onChange={(e) => setEditingCommentContent(e.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-[#e5e8eb] px-4 py-3 text-sm outline-none focus:border-[#191f28]"
                      placeholder="댓글 내용"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEditedComment}
                        disabled={savingCommentId === comment.id}
                        className="rounded-2xl bg-[#191f28] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {savingCommentId === comment.id ? '저장 중...' : '저장'}
                      </button>
                      <button
                        onClick={cancelEditComment}
                        className="rounded-2xl border border-[#e5e8eb] bg-white px-4 py-2 text-sm font-semibold text-[#4e5968]"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#191f28]">
                          {comment.author}
                        </p>
                        <p className="mt-1 text-xs text-[#8b95a1]">
                          {formatDate(comment.created_at)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditComment(comment)}
                          className="rounded-xl border border-[#e5e8eb] bg-white px-3 py-2 text-xs font-semibold text-[#4e5968]"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingCommentId === comment.id}
                          className="rounded-xl bg-red-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          {deletingCommentId === comment.id ? '삭제 중...' : '삭제'}
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-[#4e5968]">
                      {comment.content}
                    </p>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}