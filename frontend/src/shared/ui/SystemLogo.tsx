import speedometerImg from "@/assets/speedometer.png"

interface SystemLogoProps {
  className?: string
  alt?: string
}

export default function SystemLogo({ className = "h-12 w-12", alt = "Hệ thống quản lý phòng ban và dự án" }: SystemLogoProps) {
  return <img src={speedometerImg} alt={alt} className={`object-contain ${className}`} />
}
