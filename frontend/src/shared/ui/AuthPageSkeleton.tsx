export default function AuthPageSkeleton() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="hidden flex-1 overflow-hidden border-r border-border bg-muted/30 lg:flex">
        <div className="h-full w-full animate-pulse bg-gradient-to-br from-muted via-background to-muted" />
      </div>

      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 h-12 w-12 animate-pulse rounded-xl bg-muted" />
            <div className="h-7 w-40 animate-pulse rounded-full bg-muted" />
            <div className="mt-3 h-4 w-64 animate-pulse rounded-full bg-muted" />
          </div>

          <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <div className="h-4 w-20 animate-pulse rounded-full bg-muted" />
                <div className="h-11 w-full animate-pulse rounded-lg bg-muted/80" />
              </div>

              <div className="space-y-1.5">
                <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
                <div className="h-11 w-full animate-pulse rounded-lg bg-muted/80" />
              </div>

              <div className="h-11 w-full animate-pulse rounded-lg bg-primary/20" />

              <div className="flex justify-center">
                <div className="h-4 w-32 animate-pulse rounded-full bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
