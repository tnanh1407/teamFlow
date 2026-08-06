interface PageHeaderProps {
  title: string
  desc: string
}

export default function PageHeader({ title, desc }: PageHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground capitalize">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  )
}
