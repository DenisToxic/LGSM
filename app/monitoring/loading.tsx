import { Loader2 } from "lucide-react"

export default function MonitoringLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h3 className="font-medium text-xl">Loading Monitoring Dashboard...</h3>
        <p className="text-sm text-muted-foreground">Please wait while we gather your monitoring data.</p>
      </div>
    </div>
  )
}
