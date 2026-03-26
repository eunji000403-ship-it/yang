'use client'

import { usePathname } from 'next/navigation'
import AppSidebar from '@/components/app-sidebar'

const PAGE_TITLE_MAP: Record<string, string> = {
  '/dashboard': '대시보드',
  '/exhibitions': '기획전 관리',
  '/calendar': '캘린더',
  '/sales': '매출 관리',
  '/board': '게시판',
}

function getPageTitle(pathname: string) {
  if (pathname.startsWith('/board/')) return '게시판'
  if (pathname.startsWith('/exhibitions/')) return '기획전 관리'
  return PAGE_TITLE_MAP[pathname] || '업무 관리'
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

  return (
    <div className="h-screen overflow-hidden bg-[#f5f5f7]">
      <div className="flex h-full">
        <div className="fixed left-0 top-0 h-screen w-[240px]">
          <AppSidebar />
        </div>

        <main className="ml-[240px] h-screen flex-1 overflow-y-auto">
          <div className="min-h-full p-6">
            <div className="min-h-[calc(100vh-48px)] rounded-xl border border-[#eceef1] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <header className="sticky top-0 z-10 flex items-center justify-between rounded-t-xl border-b border-[#f0f1f3] bg-white/90 px-8 py-5 backdrop-blur">
                <div>
                  <h2 className="text-[20px] font-bold text-[#111111]">
                    {pageTitle}
                  </h2>
                  <p className="mt-1 text-sm text-[#9ca3af]">
                    ILANG internal workspace
                  </p>
                </div>
              </header>

              <div className="px-8 py-6">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}