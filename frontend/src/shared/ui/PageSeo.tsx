import { Helmet } from "react-helmet-async"

export interface PageSeoProps {
  title?: string
  description?: string
  canonical?: string
}

export default function PageSeo({ title, description, canonical }: PageSeoProps) {
  return (
    <Helmet>
      {title ? <title>{title}</title> : null}
      {description ? <meta name="description" content={description} /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}
    </Helmet>
  )
}
