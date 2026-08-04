interface PageHeaderProps {
  title: string
  desc: string
}

export default function PageHeader({ title, desc }: PageHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{desc}</p>
    </div>
  )
}
