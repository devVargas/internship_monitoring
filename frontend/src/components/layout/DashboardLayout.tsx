import { useState } from 'react'
import type { ReactNode } from 'react'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import DashboardSidebar from './DashboardSidebar.tsx'

type DashboardLayoutProps = {
  children: ReactNode
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false)

  function openSidebar() {
    setIsSidebarOpen(true)
  }

  function closeSidebar() {
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-neutral-50 md:flex">
      {isSidebarOpen && (
        <button
          type="button"
          className="
            fixed inset-0 z-40 bg-black/40
            md:hidden
          "
          onClick={closeSidebar}
          aria-label="Fechar menu lateral"
        />
      )}

      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      <div className="min-w-0 flex-1">
        <header
          className="
            sticky top-0 z-30 flex h-16
            items-center gap-4
            border-b border-neutral-200
            bg-white px-4 md:hidden
          "
        >
          <button
            type="button"
            onClick={openSidebar}
            className="
              flex h-10 w-10 items-center
              justify-center rounded-lg
              text-green-950 transition
              hover:bg-green-50
            "
            aria-label="Abrir menu"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          <p className="font-semibold text-green-950">
            Acompanhamento de Estágio
          </p>
        </header>

        <main className="p-5 sm:p-7 lg:p-9">
          {children}
        </main>
      </div>
    </div>
  )
}