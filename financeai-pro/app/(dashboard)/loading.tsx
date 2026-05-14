import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-10 w-48 bg-gray-700/50" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20 p-6">
            <Skeleton className="h-4 w-24 bg-gray-700/50 mb-3" />
            <Skeleton className="h-8 w-32 bg-gray-700/50" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20">
            <div className="p-6 space-y-3">
              <Skeleton className="h-5 w-40 bg-gray-700/50" />
              <Skeleton className="h-64 bg-gray-700/50" />
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20 p-6">
              <Skeleton className="h-5 w-32 bg-gray-700/50 mb-3" />
              <Skeleton className="h-24 bg-gray-700/50" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
