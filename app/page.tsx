import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <Link
        href="/login"
        className="rounded-lg border border-neutral-300 px-5 py-3 text-base font-medium text-neutral-900"
      >
        로그인 페이지로 이동
      </Link>
    </main>
  )
}