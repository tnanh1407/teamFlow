import pool from "./config/database.js";
import bcrypt from "bcryptjs";

const uuid = () => {
  const hex = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) s += "-";
    else if (i === 14) s += "4";
    else if (i === 19) s += hex[(Math.random() * 4) | 8];
    else s += hex[(Math.random() * 16) | 0];
  }
  return s;
};

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Truncate all tables in reverse dependency order
    await client.query("DELETE FROM project_logs");
    await client.query("DELETE FROM project_comments");
    await client.query("DELETE FROM project_departments");
    await client.query("DELETE FROM project_employees");
    await client.query("DELETE FROM projects");
    await client.query("DELETE FROM users");
    await client.query("UPDATE departments SET manager_id = NULL");
    await client.query("DELETE FROM employees");
    await client.query("DELETE FROM departments");
    await client.query("DELETE FROM positions");

    // ── Departments ──
    const deptIds = {
      it: uuid(),
      hr: uuid(),
      acc: uuid(),
      mkt: uuid(),
      ops: uuid(),
    };
    const departments = [
      { id: deptIds.it, name: "Công nghệ thông tin", code: "IT", desc: "Phòng Công nghệ thông tin - phụ trách hệ thống phần mềm và hạ tầng CNTT" },
      { id: deptIds.hr, name: "Nhân sự", code: "HR", desc: "Phòng Nhân sự - phụ trách tuyển dụng, đào tạo và quản lý nhân viên" },
      { id: deptIds.acc, name: "Kế toán", code: "ACC", desc: "Phòng Kế toán - phụ trách tài chính và kế toán công ty" },
      { id: deptIds.mkt, name: "Marketing", code: "MKT", desc: "Phòng Marketing - phụ trách truyền thông và quảng bá thương hiệu" },
      { id: deptIds.ops, name: "Vận hành", code: "OPS", desc: "Phòng Vận hành - phụ trách quy trình và vận hành doanh nghiệp" },
    ];
    for (const d of departments) {
      await client.query(
        `INSERT INTO departments (id, name, code, description, is_active) VALUES ($1, $2, $3, $4, true)`,
        [d.id, d.name, d.code, d.desc]
      );
    }
    console.log(`Inserted ${departments.length} departments`);

    // ── Positions ──
    const posIds = {
      gd: uuid(),
      pgd: uuid(),
      tp: uuid(),
      pp: uuid(),
      nv: uuid(),
      tts: uuid(),
    };
    const positions = [
      { id: posIds.gd, name: "Giám đốc", desc: "Giám đốc điều hành - quản lý chiến lược và định hướng phát triển", level: "Manager" },
      { id: posIds.pgd, name: "Phó Giám đốc", desc: "Phó Giám đốc - hỗ trợ điều hành và quản lý các phòng ban", level: "Senior" },
      { id: posIds.tp, name: "Trưởng phòng", desc: "Trưởng phòng - quản lý và điều phối hoạt động phòng ban", level: "Leader" },
      { id: posIds.pp, name: "Phó phòng", desc: "Phó phòng - hỗ trợ trưởng phòng trong quản lý phòng ban", level: "Middle" },
      { id: posIds.nv, name: "Nhân viên", desc: "Nhân viên chính thức - thực hiện các nhiệm vụ được giao", level: "Junior" },
      { id: posIds.tts, name: "Thực tập sinh", desc: "Thực tập sinh - học việc và hỗ trợ các công việc cơ bản", level: "Intern" },
    ];
    for (const p of positions) {
      await client.query(
        `INSERT INTO positions (id, name, description, level) VALUES ($1, $2, $3, $4)`,
        [p.id, p.name, p.desc, p.level]
      );
    }
    console.log(`Inserted ${positions.length} positions`);

    // ── Employees (without manager_id for departments) ──
    const empIds = {
      emp1: uuid(), emp2: uuid(), emp3: uuid(), emp4: uuid(), emp5: uuid(),
      emp6: uuid(), emp7: uuid(), emp8: uuid(), emp9: uuid(), emp10: uuid(),
    };
    const employees = [
      { id: empIds.emp1, dept: deptIds.it, pos: posIds.gd, code: "EMP001", name: "Nguyễn Văn Anh", email: "nguyenvananh@teamflow.com", phone: "0901234001", birth: "1985-03-15", hire: "2023-06-01", gender: "male" },
      { id: empIds.emp2, dept: deptIds.it, pos: posIds.tp, code: "EMP002", name: "Trần Thị Bích", email: "tranthibich@teamflow.com", phone: "0901234002", birth: "1990-07-22", hire: "2023-08-15", gender: "female" },
      { id: empIds.emp3, dept: deptIds.it, pos: posIds.nv, code: "EMP003", name: "Lê Văn Cường", email: "levancuong@teamflow.com", phone: "0901234003", birth: "1995-11-08", hire: "2024-03-01", gender: "male" },
      { id: empIds.emp4, dept: deptIds.hr, pos: posIds.tp, code: "EMP004", name: "Phạm Thị Dung", email: "phamthidung@teamflow.com", phone: "0901234004", birth: "1988-05-12", hire: "2023-07-01", gender: "female" },
      { id: empIds.emp5, dept: deptIds.hr, pos: posIds.nv, code: "EMP005", name: "Hoàng Văn Em", email: "hoangvanem@teamflow.com", phone: "0901234005", birth: "1997-09-25", hire: "2024-06-15", gender: "male" },
      { id: empIds.emp6, dept: deptIds.acc, pos: posIds.tp, code: "EMP006", name: "Vũ Thị Phương", email: "vuthiphuong@teamflow.com", phone: "0901234006", birth: "1991-02-18", hire: "2023-09-01", gender: "female" },
      { id: empIds.emp7, dept: deptIds.acc, pos: posIds.nv, code: "EMP007", name: "Đặng Văn Giang", email: "dangvangiang@teamflow.com", phone: "0901234007", birth: "1993-12-30", hire: "2024-04-01", gender: "male" },
      { id: empIds.emp8, dept: deptIds.mkt, pos: posIds.tp, code: "EMP008", name: "Bùi Thị Hạnh", email: "buithihanh@teamflow.com", phone: "0901234008", birth: "1992-06-14", hire: "2024-01-10", gender: "female" },
      { id: empIds.emp9, dept: deptIds.mkt, pos: posIds.nv, code: "EMP009", name: "Ngô Văn Inh", email: "ngovaninh@teamflow.com", phone: "0901234009", birth: "1999-08-05", hire: "2025-03-01", gender: "male", status: "probation" },
      { id: empIds.emp10, dept: deptIds.ops, pos: posIds.nv, code: "EMP010", name: "Dương Thị Kim", email: "duongthikim@teamflow.com", phone: "0901234010", birth: "1994-04-20", hire: "2024-07-01", gender: "female" },
    ];
    for (const e of employees) {
      await client.query(
        `INSERT INTO employees (id, department_id, position_id, employee_code, name, email, phone, birth_date, hire_date, gender, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [e.id, e.dept, e.pos, e.code, e.name, e.email, e.phone, e.birth, e.hire, e.gender, e.status || "active"]
      );
    }
    console.log(`Inserted ${employees.length} employees`);

    // ── Update departments with manager_id ──
    await client.query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [empIds.emp2, deptIds.it]);
    await client.query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [empIds.emp4, deptIds.hr]);
    await client.query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [empIds.emp6, deptIds.acc]);
    await client.query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [empIds.emp8, deptIds.mkt]);
    await client.query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [empIds.emp10, deptIds.ops]);
    console.log("Updated department managers");

    // ── Users ──
    const users = [
      { id: uuid(), empId: empIds.emp1, username: "root", password: bcrypt.hashSync("root123", 10), role: "super_admin" },
      { id: uuid(), empId: empIds.emp1, username: "admin", password: bcrypt.hashSync("admin123", 10), role: "admin" },
      { id: uuid(), empId: empIds.emp4, username: "hr_manager", password: bcrypt.hashSync("user123", 10), role: "user" },
      { id: uuid(), empId: empIds.emp6, username: "acc_user", password: bcrypt.hashSync("123456", 10), role: "user" },
    ];
    for (const u of users) {
      await client.query(
        `INSERT INTO users (id, employee_id, username, password, role, status) VALUES ($1, $2, $3, $4, $5, true)`,
        [u.id, u.empId, u.username, u.password, u.role]
      );
    }
    console.log(`Inserted ${users.length} users`);

    // ── Projects ──
    const projIds = { p1: uuid(), p2: uuid(), p3: uuid(), p4: uuid(), p5: uuid() };
    const projects = [
      { id: projIds.p1, title: "Xây dựng website TeamFlow", desc: "Dự án xây dựng website quản lý công việc nội bộ cho công ty", priority: "high", status: "in_progress", progress: 60, start: "2025-06-01", due: "2025-09-30", createdBy: empIds.emp1, assignedBy: empIds.emp1, updatedBy: empIds.emp2, est: 500, actual: 280 },
      { id: projIds.p2, title: "Phát triển ứng dụng di động", desc: "Dự án phát triển ứng dụng di động cho khách hàng trên nền tảng iOS và Android", priority: "medium", status: "todo", progress: 0, start: "2025-08-01", due: "2025-12-31", createdBy: empIds.emp1, assignedBy: empIds.emp1, est: 800, actual: 0 },
      { id: projIds.p3, title: "Nâng cấp hệ thống bảo mật", desc: "Dự án nâng cấp bảo mật toàn hệ thống CNTT", priority: "critical", status: "review", progress: 90, start: "2025-05-01", due: "2025-07-31", createdBy: empIds.emp2, assignedBy: empIds.emp2, updatedBy: empIds.emp1, est: 200, actual: 180 },
      { id: projIds.p4, title: "Chiến dịch Marketing Quý 4", desc: "Chiến dịch truyền thông và quảng bá sản phẩm mới trong quý 4 năm 2025", priority: "high", status: "in_progress", progress: 35, start: "2025-09-01", due: "2025-11-30", createdBy: empIds.emp8, assignedBy: empIds.emp8, updatedBy: empIds.emp8, est: 300, actual: 100 },
      { id: projIds.p5, title: "Tối ưu quy trình vận hành", desc: "Dự án tối ưu hóa quy trình vận hành doanh nghiệp", priority: "low", status: "completed", progress: 100, start: "2025-03-01", due: "2025-06-30", createdBy: empIds.emp10, assignedBy: empIds.emp1, updatedBy: empIds.emp6, completedBy: empIds.emp10, est: 150, actual: 140, completedAt: "2025-06-28T00:00:00.000Z" },
    ];
    for (const p of projects) {
      await client.query(
        `INSERT INTO projects (id, title, description, priority, status, progress, start_date, due_date, assigned_by, created_by, updated_by, completed_by, estimated_hours, actual_hours, completed_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [p.id, p.title, p.desc, p.priority, p.status, p.progress, p.start, p.due, p.assignedBy, p.createdBy, p.updatedBy || null, p.completedBy || null, p.est, p.actual, p.completedAt || null]
      );
    }
    console.log(`Inserted ${projects.length} projects`);

    // ── Project Employees ──
    const projEmps = [
      { pid: projIds.p1, eid: empIds.emp1, role: "leader" },
      { pid: projIds.p1, eid: empIds.emp2, role: "reviewer" },
      { pid: projIds.p1, eid: empIds.emp3, role: "member" },
      { pid: projIds.p2, eid: empIds.emp1, role: "leader" },
      { pid: projIds.p2, eid: empIds.emp3, role: "member" },
      { pid: projIds.p3, eid: empIds.emp2, role: "leader" },
      { pid: projIds.p3, eid: empIds.emp1, role: "reviewer" },
      { pid: projIds.p3, eid: empIds.emp3, role: "member" },
      { pid: projIds.p4, eid: empIds.emp8, role: "leader" },
      { pid: projIds.p4, eid: empIds.emp9, role: "member" },
      { pid: projIds.p5, eid: empIds.emp10, role: "leader" },
      { pid: projIds.p5, eid: empIds.emp6, role: "reviewer" },
    ];
    for (const pe of projEmps) {
      await client.query(
        `INSERT INTO project_employees (id, project_id, employee_id, role) VALUES ($1, $2, $3, $4)`,
        [uuid(), pe.pid, pe.eid, pe.role]
      );
    }
    console.log(`Inserted ${projEmps.length} project_employees`);

    // ── Project Departments ──
    const projDepts = [
      { pid: projIds.p1, did: deptIds.it },
      { pid: projIds.p2, did: deptIds.it },
      { pid: projIds.p3, did: deptIds.it },
      { pid: projIds.p4, did: deptIds.mkt },
      { pid: projIds.p5, did: deptIds.ops },
      { pid: projIds.p5, did: deptIds.acc },
    ];
    for (const pd of projDepts) {
      await client.query(
        `INSERT INTO project_departments (project_id, department_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [pd.pid, pd.did]
      );
    }
    console.log(`Inserted ${projDepts.length} project_departments`);

    // ── Project Comments ──
    const comments = [
      { pid: projIds.p1, eid: empIds.emp1, content: "Đã hoàn thành giai đoạn 1 - xây dựng xong giao diện cơ bản. Cần review trước khi sang giai đoạn 2." },
      { pid: projIds.p1, eid: empIds.emp2, content: "Đã review giao diện. Có một số điểm cần chỉnh sửa về UX. Sẽ gửi feedback chi tiết sau." },
      { pid: projIds.p3, eid: empIds.emp2, content: "Đã nâng cấp firewall và cập nhật chứng chỉ SSL. Cần kiểm tra lại toàn bộ hệ thống." },
      { pid: projIds.p4, eid: empIds.emp8, content: "Đã hoàn thành kế hoạch chi tiết cho chiến dịch. Đang chờ duyệt ngân sách.", attachments: "ke-hoach-mkt-q4.pdf" },
      { pid: projIds.p5, eid: empIds.emp10, content: "Dự án đã hoàn thành đúng tiến độ. Quy trình vận hành mới đã được áp dụng thành công." },
    ];
    for (const c of comments) {
      await client.query(
        `INSERT INTO project_comments (id, project_id, employee_id, content, attachments) VALUES ($1, $2, $3, $4, $5)`,
        [uuid(), c.pid, c.eid, c.content, c.attachments || null]
      );
    }
    console.log(`Inserted ${comments.length} project_comments`);

    // ── Project Logs ──
    const logs = [
      { pid: projIds.p1, eid: empIds.emp1, action: "created", desc: "Dự án được tạo bởi Nguyễn Văn Anh" },
      { pid: projIds.p1, eid: empIds.emp1, action: "assigned", desc: "Phân công Trần Thị Bích và Lê Văn Cường vào dự án" },
      { pid: projIds.p1, eid: empIds.emp1, action: "updated", desc: "Cập nhật tiến độ dự án lên 60%" },
      { pid: projIds.p3, eid: empIds.emp2, action: "created", desc: "Dự án nâng cấp bảo mật được khởi tạo" },
      { pid: projIds.p3, eid: empIds.emp2, action: "updated", desc: "Cập nhật tiến độ lên 90% - đang chờ review" },
      { pid: projIds.p4, eid: empIds.emp8, action: "created", desc: "Chiến dịch Marketing Q4 được khởi tạo" },
      { pid: projIds.p4, eid: empIds.emp8, action: "assigned", desc: "Phân công Ngô Văn Inh tham gia chiến dịch" },
      { pid: projIds.p5, eid: empIds.emp10, action: "created", desc: "Dự án tối ưu quy trình vận hành được khởi tạo" },
      { pid: projIds.p5, eid: empIds.emp10, action: "completed", desc: "Dự án hoàn thành trước thời hạn 2 ngày" },
    ];
    for (const l of logs) {
      await client.query(
        `INSERT INTO project_logs (id, project_id, employee_id, action, description) VALUES ($1, $2, $3, $4, $5)`,
        [uuid(), l.pid, l.eid, l.action, l.desc]
      );
    }
    console.log(`Inserted ${logs.length} project_logs`);

    await client.query("COMMIT");

    console.log("\n✅ Seed completed successfully!");
    console.log("---");
    console.log("Accounts:");
    console.log("  root       / root123   (super admin)");
    console.log("  admin      / admin123  (admin)");
    console.log("  hr_manager / user123");
    console.log("  acc_user   / 123456");
    console.log(`\nSummary: ${departments.length} depts, ${positions.length} positions, ${employees.length} employees, ${users.length} users, ${projects.length} projects`);
    process.exit(0);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Seed error:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
