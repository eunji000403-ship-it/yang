'use client'

import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type BoardPost = {
  id: string
  title: string
  category?: string | null
  author?: string | null
  content?: string | null
}

type Attachment = {
  id: string
  file_name?: string | null
  file_url?: string | null
}

const CATEGORY_OPTIONS = ['공지', '업무공유', '기획전', '기타']

export default function BoardWritePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('공지')
  const [author, setAuthor] = useState('관리자')
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(!!editId)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadEditData = async () => {
      if (!editId) return

      const [{ data: postData }, { data: attachmentData }] = await Promise.all([
        supabase.from('board_posts').select('*').eq('id', editId).single(),
        supabase
          .from('board_attachments')
          .select('*')
          .eq('post_id', editId)
          .order('id', { ascending: false }),
      ])

      const post = postData as BoardPost | null

      if (post) {
        setTitle(post.title || '')
        setCategory(post.category || '공지')
        setAuthor(post.author || '관리자')
        setContent(post.content || '')
      }

      setAttachments((attachmentData as Attachment[]) || [])
      setLoading(false)
    }

    loadEditData()
  }, [editId])

  const pageTitle = useMemo(() => {
    return editId ? '게시글 수정' : '게시글 작성'
  }, [editId])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setNewFiles((prev) => [...prev, ...files])
  }

  const handleRemoveNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveExistingAttachment = async (attachmentId: string) => {
    const ok = window.confirm('기존 첨부파일을 삭제할까요?')
    if (!ok) return

    const { error } = await supabase
      .from('board_attachments')
      .delete()
      .eq('id', attachmentId)

    if (error) {
      alert('첨부파일 삭제에 실패했어요.')
      return
    }

    setAttachments((prev) => prev.filter((item) => item.id !== attachmentId))
  }

  const uploadFiles = async (postId: string) => {
    if (newFiles.length === 0) return

    for (const file of newFiles) {
      const filePath = `board/${postId}/${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('board-files')
        .upload(filePath, file)

      if (uploadError) {
        console.error(uploadError)
        continue
      }

      const { data: publicData } = supabase.storage
        .from('board-files')
        .getPublicUrl(filePath)

      await supabase.from('board_attachments').insert({
        post_id: postId,
        file_name: file.name,
        file_url: publicData.publicUrl,
      })
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    setSaving(true)

    if (editId) {
      const { error } = await supabase
        .from('board_posts')
        .update({
          title: title.trim(),
          category,
          author: author.trim() || '관리자',
          content: content.trim(),
        })
        .eq('id', editId)

      if (error) {
        alert('게시글 수정에 실패했어요.')
        setSaving(false)
        return
      }

      await uploadFiles(editId)
      setSaving(false)
      alert('게시글이 수정되었어요.')
      router.push(`/board/${editId}`)
      return
    }

    const { data, error } = await supabase
      .from('board_posts')
      .insert({
        title: title.trim(),
        category,
        author: author.trim() || '관리자',
        content: content.trim(),
      })
      .select()
      .single()

    if (error || !data) {
      alert('게시글 등록에 실패했어요.')
      setSaving(false)
      return
    }

    await uploadFiles(data.id)
    setSaving(false)
    alert('게시글이 등록되었어요.')
    router.push(`/board/${data.id}`)
  }

  if (loading) {
    return <div className="p-4 text-sm text-[#8b95a1] md:p-8">작성 페이지 불러오는 중...</div>
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 md:space-y-6">
      <div>
        <h1 className="text-[20px] font-bold text-[#111111] md:text-[22px]">
          {pageTitle}
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          공지, 업무 공유, 메모를 등록할 수 있어요.
        </p>
      </div>

      <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#374151]">
              카테고리
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm outline-none focus:border-black"
            >
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#374151]">
              작성자
            </label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm outline-none focus:border-black"
              placeholder="작성자 이름"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[#374151]">
              제목
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm outline-none focus:border-black"
              placeholder="게시글 제목 입력"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[#374151]">
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[240px] w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm leading-6 outline-none focus:border-black"
              placeholder="게시글 내용을 입력하세요"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[#374151]">
              첨부파일
            </label>

            <div className="rounded-lg border border-dashed border-[#d8dde3] bg-[#fcfcfc] p-4">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-[#4b5563]"
              />
              <p className="mt-2 text-xs text-[#9ca3af]">
                여러 파일을 한 번에 첨부할 수 있어요.
              </p>
            </div>

            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-[#374151]">기존 첨부파일</p>
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex flex-col gap-2 rounded-lg border border-[#e5e7eb] p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#111111]">
                        {file.file_name || '첨부파일'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveExistingAttachment(file.id)}
                      className="w-fit rounded-md border border-[#e5e7eb] px-3 py-2 text-xs font-medium text-[#374151]"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}

            {newFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-[#374151]">새로 추가한 파일</p>
                {newFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex flex-col gap-2 rounded-lg border border-[#e5e7eb] p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#111111]">
                        {file.name}
                      </p>
                      <p className="mt-1 text-xs text-[#9ca3af]">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveNewFile(index)}
                      className="w-fit rounded-md border border-[#e5e7eb] px-3 py-2 text-xs font-medium text-[#374151]"
                    >
                      제거
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.push('/board')}
            className="rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm font-medium text-[#374151]"
          >
            취소
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? '저장 중...' : editId ? '수정 완료' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  )
}