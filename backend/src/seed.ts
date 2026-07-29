import pool from "./config/database.js";
import bcrypt from "bcryptjs";

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query("DELETE FROM task_logs");
    await client.query("DELETE FROM task_comments");
    await client.query("DELETE FROM task_departments");
    await client.query("DELETE FROM task_employees");
    await client.query("DELETE FROM tasks");
    await client.query("UPDATE departments SET manager_id = NULL");
    await client.query("DELETE FROM users");
    await client.query("DELETE FROM departments");
    await client.query("DELETE FROM positions");

    const DEPT_IT  = "10000000-0000-4000-a000-000000000001";
    const DEPT_HR  = "10000000-0000-4000-a000-000000000002";
    const DEPT_ACC = "10000000-0000-4000-a000-000000000003";
    const DEPT_MKT = "10000000-0000-4000-a000-000000000004";
    const DEPT_OPS = "10000000-0000-4000-a000-000000000005";
    const DEPT_ENG = "10000000-0000-4000-a000-000000000006";
    const DEPT_DSG = "10000000-0000-4000-a000-000000000007";

    const POS_GD  = "20000000-0000-4000-a000-000000000001";
    const POS_PGD = "20000000-0000-4000-a000-000000000002";
    const POS_TP  = "20000000-0000-4000-a000-000000000003";
    const POS_PP  = "20000000-0000-4000-a000-000000000004";
    const POS_NV  = "20000000-0000-4000-a000-000000000005";
    const POS_TTS = "20000000-0000-4000-a000-000000000006";

    const EMP: string[] = [];
    for (let i = 1; i <= 40; i++) {
      EMP[i] = `30000000-0000-4000-a000-${String(i).padStart(12, '0')}`;
    }

    const TSK1 = "50000000-0000-4000-a000-000000000001";
    const TSK2 = "50000000-0000-4000-a000-000000000002";
    const TSK3 = "50000000-0000-4000-a000-000000000003";
    const TSK4 = "50000000-0000-4000-a000-000000000004";
    const TSK5 = "50000000-0000-4000-a000-000000000005";

    const TE1  = "60000000-0000-4000-a000-000000000001";
    const TE2  = "60000000-0000-4000-a000-000000000002";
    const TE3  = "60000000-0000-4000-a000-000000000003";
    const TE4  = "60000000-0000-4000-a000-000000000004";
    const TE5  = "60000000-0000-4000-a000-000000000005";
    const TE6  = "60000000-0000-4000-a000-000000000006";
    const TE7  = "60000000-0000-4000-a000-000000000007";
    const TE8  = "60000000-0000-4000-a000-000000000008";
    const TE9  = "60000000-0000-4000-a000-000000000009";
    const TE10 = "60000000-0000-4000-a000-000000000010";

    const CMT1 = "70000000-0000-4000-a000-000000000001";
    const CMT2 = "70000000-0000-4000-a000-000000000002";
    const CMT3 = "70000000-0000-4000-a000-000000000003";

    const LOG1 = "80000000-0000-4000-a000-000000000001";
    const LOG2 = "80000000-0000-4000-a000-000000000002";

    const departments = [
      { id: DEPT_IT,  name: "Công nghệ thông tin", code: "IT",  desc: "Phòng Công nghệ thông tin - phụ trách hệ thống phần mềm và hạ tầng CNTT" },
      { id: DEPT_HR,  name: "Nhân sự",             code: "HR",  desc: "Phòng Nhân sự - phụ trách tuyển dụng, đào tạo và quản lý nhân viên" },
      { id: DEPT_ACC, name: "Kế toán",             code: "ACC", desc: "Phòng Kế toán - phụ trách tài chính và kế toán công ty" },
      { id: DEPT_MKT, name: "Marketing",           code: "MKT", desc: "Phòng Marketing - phụ trách truyền thông và quảng bá thương hiệu" },
      { id: DEPT_OPS, name: "Vận hành",            code: "OPS", desc: "Phòng Vận hành - phụ trách quy trình và vận hành doanh nghiệp" },
      { id: DEPT_ENG, name: "Kỹ thuật",            code: "ENG", desc: "Phòng Kỹ thuật - phụ trách nghiên cứu và phát triển sản phẩm" },
      { id: DEPT_DSG, name: "Thiết kế",            code: "DSG", desc: "Phòng Thiết kế - phụ trách thiết kế UI/UX, đồ họa và trải nghiệm người dùng" },
    ];
    for (const d of departments) {
      await client.query(
        `INSERT INTO departments (id, name, code, description, is_active) VALUES ($1, $2, $3, $4, true)`,
        [d.id, d.name, d.code, d.desc]
      );
    }
    console.log(`Inserted ${departments.length} departments`);

    const positions = [
      { id: POS_GD,  name: "Giám đốc",      desc: "Giám đốc điều hành - quản lý chiến lược và định hướng phát triển", level: "Manager" },
      { id: POS_PGD, name: "Phó Giám đốc",  desc: "Phó Giám đốc - hỗ trợ điều hành và quản lý các phòng ban",        level: "Senior" },
      { id: POS_TP,  name: "Trưởng phòng",   desc: "Trưởng phòng - quản lý và điều phối hoạt động phòng ban",          level: "Leader" },
      { id: POS_PP,  name: "Phó phòng",      desc: "Phó phòng - hỗ trợ trưởng phòng trong quản lý phòng ban",          level: "Middle" },
      { id: POS_NV,  name: "Nhân viên",      desc: "Nhân viên chính thức - thực hiện các nhiệm vụ được giao",           level: "Junior" },
      { id: POS_TTS, name: "Thực tập sinh",  desc: "Thực tập sinh - học việc và hỗ trợ các công việc cơ bản",           level: "Intern" },
    ];
    for (const p of positions) {
      await client.query(
        `INSERT INTO positions (id, name, description, level) VALUES ($1, $2, $3, $4)`,
        [p.id, p.name, p.desc, p.level]
      );
    }
    console.log(`Inserted ${positions.length} positions`);

    const strip = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
    const avatar = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(strip(name)).replace(/%20/g, "+")}&background=random&color=fff&size=128&bold=true`;

    const rawData = [
      { idx: 1,  dept: DEPT_IT,  pos: POS_GD,  name: "Nguyễn Văn Anh",    gender: "male",   status: true,  pwd: "root123",    role: "admin",   acctPos: null },
      { idx: 2,  dept: DEPT_IT,  pos: POS_TP,  name: "Trần Thị Bích",     gender: "female", status: true,  pwd: "admin123",   role: "admin",   acctPos: null },
      { idx: 3,  dept: DEPT_IT,  pos: POS_PP,  name: "Lê Văn Cường",      gender: "male",   status: true,  pwd: "manager123", role: "user",    acctPos: "manager" },
      { idx: 4,  dept: DEPT_IT,  pos: POS_NV,  name: "Phạm Hải Đăng",     gender: "male",   status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 5,  dept: DEPT_IT,  pos: POS_NV,  name: "Hoàng Minh Tuấn",   gender: "male",   status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 6,  dept: DEPT_IT,  pos: POS_TTS, name: "Hồ Văn Trung",      gender: "male",   status: false, pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 7,  dept: DEPT_HR,  pos: POS_TP,  name: "Phạm Thị Dung",     gender: "female", status: true,  pwd: "manager123", role: "user",    acctPos: "manager" },
      { idx: 8,  dept: DEPT_HR,  pos: POS_PP,  name: "Hoàng Văn Em",      gender: "male",   status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 9,  dept: DEPT_HR,  pos: POS_NV,  name: "Mai Thị Lan",       gender: "female", status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 10, dept: DEPT_HR,  pos: POS_NV,  name: "Đặng Thu Thảo",     gender: "female", status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 11, dept: DEPT_HR,  pos: POS_NV,  name: "Vũ Phương Thảo",    gender: "female", status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 12, dept: DEPT_HR,  pos: POS_TTS, name: "Nguyễn Bảo Châu",   gender: "female", status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 13, dept: DEPT_ACC, pos: POS_TP,  name: "Vũ Thị Phương",     gender: "female", status: true,  pwd: "manager123", role: "user",    acctPos: "manager" },
      { idx: 14, dept: DEPT_ACC, pos: POS_PP,  name: "Đặng Văn Giang",    gender: "male",   status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 15, dept: DEPT_ACC, pos: POS_NV,  name: "Đỗ Văn Hoàng",      gender: "male",   status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 16, dept: DEPT_ACC, pos: POS_NV,  name: "Ngô Thị Minh",      gender: "female", status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 17, dept: DEPT_ACC, pos: POS_NV,  name: "Bùi Thị Mai",       gender: "female", status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 18, dept: DEPT_ACC, pos: POS_TTS, name: "Trịnh Văn An",      gender: "male",   status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 19, dept: DEPT_MKT, pos: POS_TP,  name: "Bùi Thị Hạnh",      gender: "female", status: true,  pwd: "manager123", role: "user",    acctPos: "manager" },
      { idx: 20, dept: DEPT_MKT, pos: POS_PP,  name: "Trịnh Thị Ngọc",    gender: "female", status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 21, dept: DEPT_MKT, pos: POS_NV,  name: "Ngô Văn Inh",       gender: "male",   status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 22, dept: DEPT_MKT, pos: POS_NV,  name: "Lê Mỹ Duyên",       gender: "female", status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 23, dept: DEPT_MKT, pos: POS_NV,  name: "Phan Văn Nam",      gender: "male",   status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 24, dept: DEPT_MKT, pos: POS_TTS, name: "Nguyễn Khánh Linh", gender: "female", status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 25, dept: DEPT_OPS, pos: POS_TP,  name: "Lý Văn Minh",       gender: "male",   status: true,  pwd: "manager123", role: "user",    acctPos: "manager" },
      { idx: 26, dept: DEPT_OPS, pos: POS_PP,  name: "Dương Thị Kim",     gender: "female", status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 27, dept: DEPT_OPS, pos: POS_NV,  name: "Trần Bảo Nam",      gender: "male",   status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 28, dept: DEPT_OPS, pos: POS_NV,  name: "Vũ Hải Yến",        gender: "female", status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 29, dept: DEPT_OPS, pos: POS_NV,  name: "Hoàng Gia Bảo",     gender: "male",   status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 30, dept: DEPT_ENG, pos: POS_TP,  name: "Phan Văn Quốc",     gender: "male",   status: true,  pwd: "manager123", role: "user",    acctPos: "manager" },
      { idx: 31, dept: DEPT_ENG, pos: POS_PP,  name: "Đỗ Quốc Việt",      gender: "male",   status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 32, dept: DEPT_ENG, pos: POS_NV,  name: "Nguyễn Thành Long", gender: "male",   status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 33, dept: DEPT_ENG, pos: POS_NV,  name: "Trần Thu Trang",    gender: "female", status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 34, dept: DEPT_ENG, pos: POS_NV,  name: "Lê Đức Thắng",      gender: "male",   status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 35, dept: DEPT_DSG, pos: POS_TP,  name: "Nguyễn Thị Hồng",   gender: "female", status: true,  pwd: "manager123", role: "user",    acctPos: "manager" },
      { idx: 36, dept: DEPT_DSG, pos: POS_PP,  name: "Trần Đức Huy",      gender: "male",   status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 37, dept: DEPT_DSG, pos: POS_NV,  name: "Lê Thị Thanh Tâm",  gender: "female", status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 38, dept: DEPT_DSG, pos: POS_NV,  name: "Võ Minh Khôi",      gender: "male",   status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 39, dept: DEPT_DSG, pos: POS_NV,  name: "Phạm Hà Phương",    gender: "female", status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
      { idx: 40, dept: DEPT_DSG, pos: POS_TTS, name: "Đặng Hoàng Anh",    gender: "male",   status: true,  pwd: "123456",     role: "user",    acctPos: "member" },
    ];

    const nameToUsername: Record<number, string> = {
      1: "root", 2: "admin", 3: "manager", 7: "hr_manager", 13: "acc_manager",
      19: "mkt_manager", 25: "ops_manager", 30: "eng_manager", 35: "dsg_manager",
    };

    const users = rawData.map((item) => {
      const codeNum = String(item.idx).padStart(3, '0');
      const usn = nameToUsername[item.idx] || `${strip(item.name).toLowerCase().replace(/\s+/g, ".")}`;
      return {
        id: EMP[item.idx],
        dept: item.dept,
        pos: item.pos,
        code: `EMP${codeNum}`,
        name: item.name,
        email: `${strip(item.name).toLowerCase().replace(/\s+/g, "")}@teamflow.com`,
        phone: `0901234${codeNum}`,
        birth: `199${(item.idx % 9)}-05-15`,
        hire: "2024-01-15",
        gender: item.gender,
        username: usn,
        password: bcrypt.hashSync(item.pwd, 10),
        role: item.role,
        position: item.acctPos,
        status: item.status,
        avatar: avatar(item.name),
      };
    });

    for (const u of users) {
      await client.query(
        `INSERT INTO users (id, department_id, position_id, employee_code, name, email, phone, birth_date, hire_date, gender, username, password, role, position, status, avatar_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [u.id, u.dept, u.pos, u.code, u.name, u.email, u.phone, u.birth, u.hire, u.gender, u.username, u.password, u.role, u.position, u.status, u.avatar]
      );
    }
    console.log(`Inserted ${users.length} users`);

    await client.query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [EMP[1],  DEPT_IT]);
    await client.query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [EMP[7],  DEPT_HR]);
    await client.query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [EMP[13], DEPT_ACC]);
    await client.query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [EMP[19], DEPT_MKT]);
    await client.query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [EMP[25], DEPT_OPS]);
    await client.query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [EMP[30], DEPT_ENG]);
    await client.query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [EMP[35], DEPT_DSG]);
    console.log("Updated department managers");

    const tasks = [
      { id: TSK1, title: "Xây dựng website TeamFlow",       desc: "Dự án xây dựng website quản lý công việc nội bộ cho công ty",                              priority: "high",     status: "in_progress", progress: 60,  start: "2025-06-01", due: "2025-09-30", createdBy: EMP[1],  assignedBy: EMP[1],  est: 500, actual: 280 },
      { id: TSK2, title: "Phát triển ứng dụng di động",     desc: "Dự án phát triển ứng dụng di động cho khách hàng trên nền tảng iOS và Android",             priority: "medium",   status: "todo",        progress: 0,   start: "2025-08-01", due: "2025-12-31", createdBy: EMP[1],  assignedBy: EMP[1],  est: 800, actual: 0 },
      { id: TSK3, title: "Nâng cấp hệ thống bảo mật",      desc: "Dự án nâng cấp bảo mật toàn hệ thống CNTT",                                                priority: "critical", status: "review",      progress: 90,  start: "2025-05-01", due: "2025-07-31", createdBy: EMP[2],  assignedBy: EMP[2],  est: 200, actual: 180 },
      { id: TSK4, title: "Chiến dịch Marketing Quý 4",      desc: "Chiến dịch truyền thông và quảng bá sản phẩm mới trong quý 4 năm 2025",                    priority: "high",     status: "in_progress", progress: 35,  start: "2025-09-01", due: "2025-11-30", createdBy: EMP[19], assignedBy: EMP[19], est: 300, actual: 100 },
      { id: TSK5, title: "Tối ưu quy trình vận hành",       desc: "Dự án tối ưu hóa quy trình vận hành doanh nghiệp",                                        priority: "low",      status: "completed",   progress: 100, start: "2025-03-01", due: "2025-06-30", createdBy: EMP[25], assignedBy: EMP[1],  est: 150, actual: 140, completedBy: EMP[25], completedAt: "2025-06-28T00:00:00.000Z" },
    ];
    for (const t of tasks) {
      await client.query(
        `INSERT INTO tasks (id, title, description, priority, status, progress, start_date, due_date, assigned_by, created_by, completed_by, estimated_hours, actual_hours, completed_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [t.id, t.title, t.desc, t.priority, t.status, t.progress, t.start, t.due, t.assignedBy, t.createdBy, t.completedBy || null, t.est, t.actual, t.completedAt || null]
      );
    }
    console.log(`Inserted ${tasks.length} tasks`);

    const taskEmployees = [
      { id: TE1,  tid: TSK1, eid: EMP[1],  role: "leader" },
      { id: TE2,  tid: TSK1, eid: EMP[2],  role: "reviewer" },
      { id: TE3,  tid: TSK1, eid: EMP[3],  role: "member" },
      { id: TE4,  tid: TSK1, eid: EMP[7],  role: "member" },
      { id: TE5,  tid: TSK2, eid: EMP[1],  role: "leader" },
      { id: TE6,  tid: TSK2, eid: EMP[3],  role: "member" },
      { id: TE7,  tid: TSK2, eid: EMP[30], role: "member" },
      { id: TE8,  tid: TSK3, eid: EMP[2],  role: "leader" },
      { id: TE9,  tid: TSK3, eid: EMP[1],  role: "reviewer" },
      { id: TE10, tid: TSK3, eid: EMP[3],  role: "member" },
    ];
    for (const te of taskEmployees) {
      await client.query(
        `INSERT INTO task_employees (id, task_id, employee_id, role) VALUES ($1, $2, $3, $4)`,
        [te.id, te.tid, te.eid, te.role]
      );
    }
    console.log(`Inserted ${taskEmployees.length} task_employees`);

    const taskDepts = [
      { tid: TSK1, did: DEPT_IT },
      { tid: TSK1, did: DEPT_HR },
      { tid: TSK2, did: DEPT_IT },
      { tid: TSK2, did: DEPT_ENG },
      { tid: TSK3, did: DEPT_IT },
      { tid: TSK4, did: DEPT_MKT },
      { tid: TSK4, did: DEPT_ENG },
      { tid: TSK5, did: DEPT_OPS },
      { tid: TSK5, did: DEPT_ACC },
      { tid: TSK5, did: DEPT_HR },
    ];
    for (const td of taskDepts) {
      await client.query(
        `INSERT INTO task_departments (task_id, department_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [td.tid, td.did]
      );
    }
    console.log(`Inserted ${taskDepts.length} task_departments`);

    const comments = [
      { id: CMT1, tid: TSK1, eid: EMP[1],  content: "Đã hoàn thành giai đoạn 1 - xây dựng xong giao diện cơ bản. Cần review trước khi sang giai đoạn 2." },
      { id: CMT2, tid: TSK1, eid: EMP[2],  content: "Đã review giao diện. Có một số điểm cần chỉnh sửa về UX. Sẽ gửi feedback chi tiết sau." },
      { id: CMT3, tid: TSK3, eid: EMP[2],  content: "Đã nâng cấp firewall và cập nhật chứng chỉ SSL. Cần kiểm tra lại toàn bộ hệ thống." },
    ];
    for (const c of comments) {
      await client.query(
        `INSERT INTO task_comments (id, task_id, employee_id, content) VALUES ($1, $2, $3, $4)`,
        [c.id, c.tid, c.eid, c.content]
      );
    }
    console.log(`Inserted ${comments.length} task_comments`);

    const logs = [
      { id: LOG1, tid: TSK1, eid: EMP[1],  action: "created",   desc: "Dự án được tạo bởi Nguyễn Văn Anh" },
      { id: LOG2, tid: TSK1, eid: EMP[1],  action: "assigned",  desc: "Phân công Trần Thị Bích và Lê Văn Cường vào dự án" },
    ];
    for (const l of logs) {
      await client.query(
        `INSERT INTO task_logs (id, task_id, employee_id, action, description) VALUES ($1, $2, $3, $4, $5)`,
        [l.id, l.tid, l.eid, l.action, l.desc]
      );
    }
    console.log(`Inserted ${logs.length} task_logs`);

    await client.query("COMMIT");

    console.log("\n✅ Seed completed successfully!");
    console.log("---");
    console.log(`Summary: ${departments.length} depts, ${positions.length} positions, ${users.length} users, ${tasks.length} tasks`);
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
