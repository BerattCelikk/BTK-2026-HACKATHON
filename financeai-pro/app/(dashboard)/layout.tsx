import { Sidebar, MobileHeader } from "@/components/shared/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar />
      <MobileHeader />
      <main className="lg:pl-64">
        <div className="px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
