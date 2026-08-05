import PageHeader from "@/components/PageHeader"
import SystemNotificationsSection from "./components/SystemNotificationsSection"

export default function SystemNotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Thông báo hệ thống"
        desc="Quản lí thông báo hệ thống từ một khu vực riêng trong mục Quản trị"
      />
      <SystemNotificationsSection mode="manage" />
    </div>
  )
}
