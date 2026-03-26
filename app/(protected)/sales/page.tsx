'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SalesPage() {
  const [message, setMessage] = useState('로딩 중...')

  useEffect(() => {
    const run = async () => {
      try {
        const { error } = await supabase.from('sales').select('id').limit(1)
        if (error) {
          setMessage(`Supabase 에러: ${error.message}`)
          return
        }
        setMessage('Supabase 연결 성공')
      } catch (e) {
        setMessage('런타임 오류 발생')
        console.error(e)
      }
    }

    run()
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-[22px] font-bold text-[#111111]">매출 관리</h1>
      <div className="rounded-lg border border-[#e5e7eb] bg-white p-5">
        <p className="text-sm text-[#111111]">{message}</p>
      </div>
    </div>
  )
}