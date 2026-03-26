import { Suspense } from 'react'
import WritePageClient from './WritePageClient'

export default function BoardWritePage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 text-sm text-[#8b95a1] md:p-8">
          작성 페이지 불러오는 중...
        </div>
      }
    >
      <WritePageClient />
    </Suspense>
  )
}