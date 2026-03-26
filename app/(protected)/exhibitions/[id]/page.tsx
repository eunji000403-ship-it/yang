import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function ExhibitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data, error } = await supabase
    .from('exhibitions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#e9edf0] bg-white p-6">
        <p className="text-sm font-medium text-[#8b95a1]">{data.platform}</p>
        <h1 className="mt-2 text-3xl font-bold text-[#191f28]">{data.title}</h1>
        <p className="mt-3 text-sm text-[#6b7684]">
          {data.start_date} ~ {data.end_date}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-[#e9edf0] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#191f28]">기본 정보</h2>
          <div className="mt-4 space-y-3 text-sm text-[#4e5968]">
            <p><span className="font-medium text-[#191f28]">상태:</span> {data.status}</p>
            <p><span className="font-medium text-[#191f28]">담당자:</span> {data.owner || '-'}</p>
            <p><span className="font-medium text-[#191f28]">참여 상태:</span> {data.participation_status || '-'}</p>
            <p><span className="font-medium text-[#191f28]">할인 조건:</span> {data.discount || '-'}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-[#e9edf0] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#191f28]">메모</h2>
          <p className="mt-4 text-sm leading-7 text-[#4e5968]">
            {data.memo || '등록된 메모가 없습니다.'}
          </p>
        </div>
      </div>
    </div>
  )
}