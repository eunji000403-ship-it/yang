export type ExhibitionStatus = '진행중' | '예정' | '종료' | '-'

export function getDateOnly(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function getDisplayStatus(item: {
  start_date?: string | null
  end_date?: string | null
  status?: string | null
}): ExhibitionStatus {
  const today = new Date()
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )

  const start = getDateOnly(item.start_date)
  const end = getDateOnly(item.end_date)

  if (!start || !end) {
    return '-'
  }

  if (todayOnly < start) return '예정'
  if (todayOnly > end) return '종료'
  return '진행중'
}

export function getStatusTextClass(status?: string | null) {
  switch (status) {
    case '진행중':
      return 'text-[#111111] font-semibold'
    case '예정':
      return 'text-[#9ca3af] font-medium'
    case '종료':
      return 'text-[#d1d5db] font-medium'
    default:
      return 'text-[#6b7280] font-medium'
  }
}

export function getCalendarEventClass(status?: string | null) {
  switch (status) {
    case '진행중':
      return 'highlight-green'
    case '예정':
      return 'highlight-blue'
    case '종료':
      return 'highlight-gray'
    default:
      return 'highlight-gray'
  }
}