'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  LayoutGrid,
  BriefcaseBusiness,
  CalendarDays,
  BarChart3,
  FileText,
  ChevronRight,
  Settings2,
  LogOut,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const MENU_ITEMS = [
  { label: '대시보드', href: '/dashboard', icon: LayoutGrid },
  { label: '기획전 관리', href: '/exhibitions', icon: BriefcaseBusiness },
  { label: '캘린더', href: '/calendar', icon: CalendarDays },
  { label: '매출 관리', href: '/sales', icon: BarChart3 },
  { label: '게시판', href: '/board', icon: FileText },
]

type Props = {
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

export default function AppSidebar({
  mobileOpen = false,
  onCloseMobile,
}: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const [userEmail, setUserEmail] = useState('')
  const [profileName, setProfileName] = useState('User')
  const [profilePhoto, setProfilePhoto] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const [draftName, setDraftName] = useState('')
  const [draftPhoto, setDraftPhoto] = useState('')

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()

      const email = data.user?.email || ''
      const defaultName = email ? email.split('@')[0] : 'User'

      setUserEmail(email)

      const savedName = localStorage.getItem('ilang_profile_name')
      const savedPhoto = localStorage.getItem('ilang_profile_photo')

      setProfileName(savedName || defaultName)
      setProfilePhoto(savedPhoto || '')
      setDraftName(savedName || defaultName)
      setDraftPhoto(savedPhoto || '')
    }

    loadUser()
  }, [])

  const initials = useMemo(() => {
    return (profileName || 'U').slice(0, 1).toUpperCase()
  }, [profileName])

  const handleSaveProfile = () => {
    const safeName = draftName.trim() || 'User'
    const safePhoto = draftPhoto.trim()

    localStorage.setItem('ilang_profile_name', safeName)
    localStorage.setItem('ilang_profile_photo', safePhoto)

    setProfileName(safeName)
    setProfilePhoto(safePhoto)
    setIsProfileOpen(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition md:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onCloseMobile}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r border-[#e5e7eb] bg-white px-5 py-6 transition-transform duration-200 md:static md:z-auto md:w-[240px] md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between pb-8">
          <Link
            href="/dashboard"
            className="block"
            onClick={onCloseMobile}
          >
            <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[#111111]">
              ILANG
            </h1>
          </Link>

          <button
            onClick={onCloseMobile}
            className="rounded-lg border border-[#e5e7eb] p-2 text-[#6b7280] md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm transition ${
                  active
                    ? 'bg-[#f3f4f6] text-[#111111]'
                    : 'text-[#6b7280] hover:bg-[#fafafa] hover:text-[#111111]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.2 : 2}
                    className={active ? 'text-[#111111]' : 'text-[#9ca3af] group-hover:text-[#111111]'}
                  />
                  <span className={active ? 'font-semibold' : 'font-medium'}>
                    {item.label}
                  </span>
                </div>

                <ChevronRight
                  size={15}
                  className={active ? 'text-[#111111]' : 'text-[#d1d5db] group-hover:text-[#9ca3af]'}
                />
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-[#eeeeee] pt-4">
          <div className="rounded-[20px] border border-[#efefef] bg-[#fcfcfc] p-4">
            <div className="flex items-center gap-3">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={profileName}
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3f4f6] text-sm font-semibold text-[#111111]">
                  {initials}
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#111111]">
                  {profileName}
                </p>
                <p className="truncate text-xs text-[#9ca3af]">
                  {userEmail || '로그인 사용자'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-xs font-medium text-[#4b5563] hover:bg-[#f9fafb]"
              >
                <Settings2 size={14} />
                설정
              </button>

              <button
                onClick={handleLogout}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#111111] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1f2937]"
              >
                <LogOut size={14} />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </aside>

      {isProfileOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#191f28]">프로필 설정</h2>
                <p className="mt-1 text-sm text-[#8b95a1]">
                  이름과 사진을 직접 설정할 수 있어요.
                </p>
              </div>

              <button
                onClick={() => setIsProfileOpen(false)}
                className="rounded-lg border border-[#e5e8eb] px-3 py-2 text-sm text-[#6b7684]"
              >
                닫기
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#4e5968]">
                  이름
                </label>
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="w-full rounded-lg border border-[#e5e8eb] px-4 py-3 text-sm outline-none focus:border-[#111111]"
                  placeholder="예: 은지"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#4e5968]">
                  사진 URL
                </label>
                <input
                  value={draftPhoto}
                  onChange={(e) => setDraftPhoto(e.target.value)}
                  className="w-full rounded-lg border border-[#e5e8eb] px-4 py-3 text-sm outline-none focus:border-[#111111]"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveProfile}
                className="flex-1 rounded-lg bg-[#111111] px-4 py-3 text-sm font-semibold text-white"
              >
                저장
              </button>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="flex-1 rounded-lg border border-[#e5e8eb] bg-white px-4 py-3 text-sm font-semibold text-[#4e5968]"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}