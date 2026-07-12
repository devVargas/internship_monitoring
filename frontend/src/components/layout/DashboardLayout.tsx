import type { ReactNode } from 'react'
import StaffSidebar from './StaffSidebar.tsx'

type StaffPageLayoutProps = {
  children: ReactNode
}

export default function StaffPageLayout({ children }: StaffPageLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50 md:flex">
      <StaffSidebar />
      <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
    </div>
  )
}
