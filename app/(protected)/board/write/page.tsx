'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function BoardWritePage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('공지')
  const [author, setAuthor] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title || !content || !category || !author) {
      alert('제목, 내용, 분류, 작성자는 모두 입력해야 해.')
      return
    }

    setSaving(true)

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        category,
        author,
      })
      .select()
      .single()

    if (error || !data) {
      alert(`등록 실패: ${error?.message}`)
      setSaving(false)
      return
    }

    const postId = data.id

    if (files && files.length > 0) {
      for (const file of Array.from(files)) {
        const filePath = `${postId}/${Date.now()}-${file.name}`

        const { error: uploadError } = await supabase.storage
          .from('board-files')
          .upload(filePath, file)

        if (uploadError) {
          alert(`파일 업로드 실패: ${uploadError.message}`)
          continue
        }

        const { data: publicUrlData } = supabase.storage
          .from('board-files')
          .getPublicUrl(filePath)

        await supabase.from('post_files').insert({
          post_id: postId,
          file_name: file.name,
          file_path: filePath,
          file_url: publicUrlData.publicUrl,
        })
      }
    }

    alert('등록 완료!')
    setSaving(false)
    router.push(`/board/${postId}`)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#191f28]">게시글 작성</h1>
        <p className="mt-2 text-sm text-[#8b95a1]">
          공지, 회의록, 업무공유 글을 작성하고 파일도 첨부할 수 있어요.
        </p>
      </div>

      <div className="rounded-3xl border border-[#e9edf0] bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[#4e5968]">제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-[#e5e8eb] px-4 py-3 text-sm outline-none focus:border-[#191f28]"
              placeholder="게시글 제목을 입력하세요"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#4e5968]">분류</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-[#e5e8eb] px-4 py-3 text-sm outline-none focus:border-[#191f28]"
            >
              <option value="공지">공지</option>
              <option value="회의록">회의록</option>
              <option value="업무공유">업무공유</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#4e5968]">작성자</label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full rounded-2xl border border-[#e5e8eb] px-4 py-3 text-sm outline-none focus:border-[#191f28]"
              placeholder="예: 은지"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[#4e5968]">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full rounded-2xl border border-[#e5e8eb] px-4 py-3 text-sm outline-none focus:border-[#191f28]"
              placeholder="게시글 내용을 입력하세요"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[#4e5968]">파일 첨부</label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="block w-full text-sm"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-2xl bg-[#191f28] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>

          <button
            onClick={() => router.push('/board')}
            className="rounded-2xl border border-[#e5e8eb] bg-white px-5 py-3 text-sm font-semibold text-[#4e5968]"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  )
}