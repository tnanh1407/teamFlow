interface TableStateRowProps {
  colSpan: number
  title: string
  description?: string
  loading?: boolean
}

export default function TableStateRow({ colSpan, title, description, loading = false }: TableStateRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          {loading ? (
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          ) : null}
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </td>
    </tr>
  )
}
