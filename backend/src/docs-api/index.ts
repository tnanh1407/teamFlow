import { userSchemas, userPaths } from "./user.docs.js";
import { departmentSchemas, departmentPaths } from "./department.docs.js";
import { positionSchemas, positionPaths } from "./position.docs.js";
import { sessionSchemas, sessionPaths } from "./session.docs.js";
import { projectSchemas, projectPaths } from "./project.docs.js";
import { projectTaskSchemas, projectTaskPaths } from "./project-task.docs.js";
import { projectEmployeeSchemas, projectEmployeePaths } from "./project-employee.docs.js";
import { projectDepartmentSchemas, projectDepartmentPaths } from "./project-department.docs.js";
import { projectCommentSchemas, projectCommentPaths } from "./project-comment.docs.js";
import { projectLogSchemas, projectLogPaths } from "./project-log.docs.js";
import { searchSchemas, searchPaths } from "./search.docs.js";

export const apiSpec = {
  info: {
    title: "Hệ Thống Quản Lý Phòng Ban & Dự Án",
    description: `### Hệ Thống RESTful API Quản Lý Nhân Sự & Vận Hành Nội Bộ (Quản Lý Phòng Ban & Dự Án)

API được thiết kế chuẩn hoá theo kiến trúc RESTful nhằm phục vụ toàn bộ các thao tác nghiệp vụ quản trị doanh nghiệp: phân quyền nhân sự, cơ cấu tổ chức (phòng ban – chức vụ), quản lý dự án, giao việc, cộng tác và giám sát tiến độ.

---

### 🚀 Các Phân Hệ & Endpoint Chính:

#### 1. Quản Lý Tài Khoản & Phân Quyền (Users & Authentication)
- **Xác thực:** Đăng nhập (\`POST /api/users/login\`), Đăng xuất (\`POST /api/users/logout\`), Đổi mật khẩu (\`PATCH /api/users/updatePs\`), Quên mật khẩu – gửi mã 6 số qua email (\`POST /api/users/forgot-password\`, \`POST /api/users/reset-password\`).
- **Hồ sơ cá nhân:** Cập nhật ảnh đại diện (\`POST /api/users/me/avatar\`).
- **Quản trị Nhân viên:** Danh sách phân trang (\`GET /api/users\`), Toàn bộ nhân viên (\`GET /api/users/all\`), Tìm kiếm (\`GET /api/users/search\`), Xem chi tiết (\`GET /api/users/{id}\`), Tạo mới (\`POST /api/users\`), Cập nhật (\`PATCH /api/users/{id}\`), Vô hiệu hoá tài khoản (\`DELETE /api/users/{id}\`).
- **Trạng thái tài khoản:** Hệ thống lưu đồng thời \`status\` và \`leaveDate\`; nếu nhân viên đã nghỉ việc hoặc bị khoá thì API đăng nhập và middleware xác thực sẽ từ chối truy cập với mã \`403 Forbidden\`.
- **Lọc theo tiêu chí:** Nhân viên theo phòng ban (\`GET /api/users/department/{departmentId}\`), theo chức vụ (\`GET /api/users/position/{positionId}\`).

#### 2. Quản Lý Phòng Ban (Departments)
- Quản lý cơ cấu tổ chức doanh nghiệp (\`GET / POST / PATCH / DELETE /api/departments\`).
- Hỗ trợ thiết lập thông tin phòng ban, mã phòng ban (Code) và chỉ định Trưởng phòng (\`managerId\`).

#### 3. Quản Lý Chức Vụ & Cấp Bậc (Positions)
- Quản lý danh mục chức danh, vị trí công tác và cấp bậc (\`level\`) của nhân sự (\`GET / POST / PATCH / DELETE /api/positions\`).

#### 4. Quản Lý Dự Án (Projects)
- Danh sách dự án (\`GET /api/projects\`), Dự án của tôi (\`GET /api/projects/me\`), Lọc theo trạng thái (\`GET /api/projects/status/{status}\`), theo độ ưu tiên (\`GET /api/projects/priority/{priority}\`), theo người tạo (\`GET /api/projects/created-by/{employeeId}\`).
- Xem chi tiết (\`GET /api/projects/{id}\`), Danh sách nhân viên của dự án (\`GET /api/projects/{id}/employees\`).
- Tạo mới (\`POST /api/projects\`), Cập nhật – gồm cả tự đánh giá progress (\`PATCH /api/projects/{id}\`), Xoá (\`DELETE /api/projects/{id}\`).

#### 5. Quản Lý Công Việc (Project Tasks)
- Danh sách task (\`GET /api/project-tasks\`), Task theo dự án (\`GET /api/project-tasks/project/{projectId}\`), theo nhân viên (\`GET /api/project-tasks/employee/{id}\`), chi tiết (\`GET /api/project-tasks/{id}\`).
- Tạo/giao task (\`POST /api/project-tasks\`), Cập nhật trạng thái (\`PATCH /api/project-tasks/{id}\`), Xoá (\`DELETE /api/project-tasks/{id}\`) – chỉ Manager mới được tạo/giao task, Manager hoặc assignee được cập nhật.

#### 6. Phân Công Nhân Sự (Project Employees)
- Danh sách phân công (\`GET /api/project-employees\`), theo nhân viên (\`GET /api/project-employees/employee/{employeeId}\`), chi tiết (\`GET /api/project-employees/{id}\`).
- Thêm nhân viên vào dự án (\`POST /api/project-employees\`), Cập nhật vai trò (\`PATCH /api/project-employees/{id}\`), Xoá khỏi dự án (\`DELETE /api/project-employees/{id}\`).

#### 7. Phòng Ban Trong Dự Án (Project Departments)
- Danh sách phòng ban tham gia dự án (\`GET /api/project-departments\`), theo dự án (\`GET /api/project-departments/project/{projectId}\`).
- Gắn phòng ban vào dự án (\`POST /api/project-departments\`), Gỡ phòng ban khỏi dự án (\`DELETE /api/project-departments\`).

#### 8. Bình Luận & Đính Kèm (Project Comments)
- Danh sách bình luận (\`GET /api/project-comments\`), theo dự án (\`GET /api/project-comments/project/{projectId}\`), theo nhân viên (\`GET /api/project-comments/employee/{employeeId}\`), chi tiết (\`GET /api/project-comments/{id}\`).
- Tạo bình luận (\`POST /api/project-comments\`), Upload file đính kèm (\`POST /api/project-comments/upload\`), Cập nhật (\`PATCH /api/project-comments/{id}\`), Xoá (\`DELETE /api/project-comments/{id}\`).

#### 9. Nhật Ký Hoạt Động (Project Logs)
- Danh sách log (\`GET /api/project-logs\`), theo dự án (\`GET /api/project-logs/project/{projectId}\`), theo nhân viên (\`GET /api/project-logs/employee/{employeeId}\`), chi tiết (\`GET /api/project-logs/{id}\`).
- Ghi log tự động khi có thay đổi dự án/task; chỉ Admin mới xem được danh sách log, còn các thao tác ghi log thủ công không dành cho admin.

#### 10. Tìm Kiếm Nhanh Toàn Hệ Thống (Search - Ctrl+K)
- Tìm kiếm gộp nhân viên, dự án, task, phòng ban, chức vụ trong một lần gọi (\`GET /api/search?q=...\`) — mỗi nhóm tối đa 5 kết quả; nhân viên thường chỉ nhận kết quả trong phạm vi của mình.

---

### 🔒 Quy Trình Xác Thực & Bảo Mật (Authentication Security):
Hệ thống hỗ trợ 2 phương thức xác thực bảo mật song song:
1. **CookieAuth:** Tự động gửi HTTP-Only Cookie chứa JWT token (\`token\`) trong các yêu cầu từ Web Browser.
2. **BearerAuth:** Gửi HTTP Header \`Authorization: Bearer <JWT_TOKEN>\` phù hợp cho Mobile App hoặc các tích hợp bên ngoài.

Phân quyền (Authorization) dựa trên \`role\` (admin / user) và \`position\` (manager / member):
- **Admin:** Xem project, log và thống kê tổng quan; không tham gia như người thực thi, không tạo/sửa/xoá dữ liệu dự án.
- **Manager:** Quản lý dự án, tạo/giao task, phân công phòng ban, đánh giá tiến độ và theo dõi nhân viên trong phòng ban của mình.
- **User/Member:** Xem dự án được phân công, cập nhật task của mình, bình luận và đăng tải file đính kèm.

---

### ⚠️ Mã Lỗi Chuẩn (Standard HTTP Status Codes):
- \`200 OK\` / \`201 Created\`: Yêu cầu thực thi thành công.
- \`400 Bad Request\`: Dữ liệu gửi lên không hợp lệ hoặc thiếu trường bắt buộc.
- \`401 Unauthorized\`: Chưa xác thực hoặc Token không hợp lệ/hết hạn.
- \`403 Forbidden\`: Tài khoản bị vô hiệu hoá hoặc không đủ quyền hạn.
- \`404 Not Found\`: Tài nguyên requested không tồn tại.
- \`409 Conflict\`: Trùng lặp dữ liệu độc nhất (Ví dụ: Username/Email đã tồn tại).
- \`500 Internal Server Error\`: Lỗi không xác định từ phía máy chủ.`,
    contact: {
      name: "Đội Ngũ Phát Triển Hệ Thống Quản Lý Phòng Ban & Dự Án",
      email: "support@qlpbda.local",
    },
    license: {
      name: "Internal Proprietary",
    },
  },
  servers: [{ url: "http://localhost:5000", description: "Local dev" }],
  components: {
    securitySchemes: {
      cookieAuth: { type: "apiKey", in: "cookie", name: "token" },
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      ...userSchemas,
      ...departmentSchemas,
      ...positionSchemas,
      ...sessionSchemas,
      ...projectSchemas,
      ...projectTaskSchemas,
      ...projectEmployeeSchemas,
      ...projectDepartmentSchemas,
      ...projectCommentSchemas,
      ...projectLogSchemas,
      ...searchSchemas,
    },
  },
  paths: {
    ...userPaths,
    ...departmentPaths,
    ...positionPaths,
    ...sessionPaths,
    ...projectPaths,
    ...projectTaskPaths,
    ...projectEmployeePaths,
    ...projectDepartmentPaths,
    ...projectCommentPaths,
    ...projectLogPaths,
    ...searchPaths,
  },
};
