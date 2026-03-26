'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import AppSidebar from '@/components/app-sidebar'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="flex min-h-screen">
        <div className="hidden md:block md:w-[240px] md:flex-shrink-0">
          <AppSidebar />
        </div>

        <div className="md:hidden">
          <AppSidebar
            mobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
          />
        </div>

        <main className="min-h-screen flex-1">
          <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#eceef1] bg-white px-4 py-4 md:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-[#e5e7eb] p-2 text-[#111111]"
            >
              <Menu size={18} />
            </button>
            <span className="text-base font-semibold text-[#111111]">ILANG</span>
          </div>

          <div className="p-3 md:p-6">
            <div className="min-h-[calc(100vh-24px)] rounded-xl border border-[#eceef1] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:min-h-[calc(100vh-48px)] md:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}