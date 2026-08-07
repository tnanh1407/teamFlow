interface PageHeaderProps {
  title: string
  desc: string
}

export default function PageHeader({ title, desc }: PageHeaderProps) {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-[15px]">{desc}</p>
    </div>
  )
}
