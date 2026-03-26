'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(`로그인 실패: ${error.message}`)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-semibold text-neutral-900">로그인</h1>

        <input
          className="mb-3 w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="mb-4 w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full rounded-lg bg-black px-4 py-3 text-white"
          onClick={handleLogin}
        >
          로그인
        </button>
      </div>
    </div>
  )
}