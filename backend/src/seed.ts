import pool from "./config/database.js";
import bcrypt from "bcryptjs";

// uuid() chỉ dùng cho dữ liệu mới tạo runtime, không dùng cho seed data
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
    await client.query("UPDATE departments SET manager_id = NULL");
    await client.query("DELETE FROM employees");
    await client.query("DELETE FROM departments");
    await client.query("DELETE FROM positions");

    // ══════════════════════════════════════════════════════════
    //  ID CỐ ĐỊNH cho dữ liệu mẫu (valid UUID v4)
    //  Quy ước prefix: 1x=dept, 2x=pos, 3x=emp, 4x=user,
    //                   5x=proj, 6x=pe,  7x=cmt, 8x=log
    // ══════════════════════════════════════════════════════════

    // ── Department IDs ──
    const DEPT_IT  = "10000000-0000-4000-a000-000000000001";
    const DEPT_HR  = "10000000-0000-4000-a000-000000000002";
    const DEPT_ACC = "10000000-0000-4000-a000-000000000003";
    const DEPT_MKT = "10000000-0000-4000-a000-000000000004";
    const DEPT_OPS = "10000000-0000-4000-a000-000000000005";
    const DEPT_ENG = "10000000-0000-4000-a000-000000000006";
    const DEPT_DSG = "10000000-0000-4000-a000-000000000007";

    // ── Position IDs ──
    const POS_GD  = "20000000-0000-4000-a000-000000000001";
    const POS_PGD = "20000000-0000-4000-a000-000000000002";
    const POS_TP  = "20000000-0000-4000-a000-000000000003";
    const POS_PP  = "20000000-0000-4000-a000-000000000004";
    const POS_NV  = "20000000-0000-4000-a000-000000000005";
    const POS_TTS = "20000000-0000-4000-a000-000000000006";

    // ── Employee IDs (40 employees) ──
    const EMP: string[] = [];
    for (let i = 1; i <= 40; i++) {
      EMP[i] = `30000000-0000-4000-a000-${String(i).padStart(12, '0')}`;
    }

    // ── User IDs (40 users) ──
    const USER: string[] = [];
    for (let i = 1; i <= 40; i++) {
      USER[i] = `40000000-0000-4000-a000-${String(i).padStart(12, '0')}`;
    }

    // ── Project IDs ──
    const PROJ1 = "50000000-0000-4000-a000-000000000001";
    const PROJ2 = "50000000-0000-4000-a000-000000000002";
    const PROJ3 = "50000000-0000-4000-a000-000000000003";
    const PROJ4 = "50000000-0000-4000-a000-000000000004";
    const PROJ5 = "50000000-0000-4000-a000-000000000005";

    // ── Project Employee IDs ──
    const PE1  = "60000000-0000-4000-a000-000000000001";
    const PE2  = "60000000-0000-4000-a000-000000000002";
    const PE3  = "60000000-0000-4000-a000-000000000003";
    const PE4  = "60000000-0000-4000-a000-000000000004";
    const PE5  = "60000000-0000-4000-a000-000000000005";
    const PE6  = "60000000-0000-4000-a000-000000000006";
    const PE7  = "60000000-0000-4000-a000-000000000007";
    const PE8  = "60000000-0000-4000-a000-000000000008";
    const PE9  = "60000000-0000-4000-a000-000000000009";
    const PE10 = "60000000-0000-4000-a000-000000000010";

    // ── Comment IDs ──
    const CMT1 = "70000000-0000-4000-a000-000000000001";
    const CMT2 = "70000000-0000-4000-a000-000000000002";
    const CMT3 = "70000000-0000-4000-a000-000000000003";

    // ── Log IDs ──
    const LOG1 = "80000000-0000-4000-a000-000000000001";
    const LOG2 = "80000000-0000-4000-a000-000000000002";

    // ── Departments ──
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

    // ── Positions ──
    const positions = [
      { id: POS_GD,  name: "Giám đốc",      desc: "Giám đốc điều hành - quản lý chiến lược và định hướng phát triển", level: "Manager" },
      { id: POS_PGD, name: "Phó Giám đốc",  desc: "Phó Giám đốc - hỗ trợ điều hành và quản lý các phòng ban",        level: "Senior" },
      { id: POS_TP,  name: "Trưởng phòng",   desc: "Trưởng phòng - quản lý và điều phối hoạt động phòng ban",          level: "Manager" },
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

    // ── Employees (40 Employees across 7 departments) ──
    const strip = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
    const avatar = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(strip(name)).replace(/%20/g, "+")}&background=random&color=fff&size=128&bold=true`;

    const rawEmployeesData = [
      // IT (6)
      { idx: 1,  dept: DEPT_IT,  pos: POS_GD,  name: "Nguyễn Văn Anh",    username: "root",       role: "admin",  position: "admin",   gender: "male",   status: "active" },
      { idx: 2,  dept: DEPT_IT,  pos: POS_TP,  name: "Trần Thị Bích",     username: "admin",      role: "admin",  position: "admin",   gender: "female", status: "active" },
      { idx: 3,  dept: DEPT_IT,  pos: POS_PP,  name: "Lê Văn Cường",      username: "manager",    role: "user",   position: "manager", gender: "male",   status: "active" },
      { idx: 4,  dept: DEPT_IT,  pos: POS_NV,  name: "Phạm Hải Đăng",     username: "hai.dang",   role: "user",   position: "member",  gender: "male",   status: "active" },
      { idx: 5,  dept: DEPT_IT,  pos: POS_NV,  name: "Hoàng Minh Tuấn",   username: "minh.tuan",  role: "user",   position: "member",  gender: "male",   status: "active" },
      { idx: 6,  dept: DEPT_IT,  pos: POS_TTS, name: "Hồ Văn Trung",      username: "van.trung",  role: "user",   position: "member",  gender: "male",   status: "probation" },

      // HR (6)
      { idx: 7,  dept: DEPT_HR,  pos: POS_TP,  name: "Phạm Thị Dung",     username: "hr_manager", role: "user",   position: "manager", gender: "female", status: "active" },
      { idx: 8,  dept: DEPT_HR,  pos: POS_PP,  name: "Hoàng Văn Em",      username: "hoang.em",   role: "user",   position: "member",  gender: "male",   status: "active" },
      { idx: 9,  dept: DEPT_HR,  pos: POS_NV,  name: "Mai Thị Lan",       username: "mai.lan",    role: "user",   position: "member",  gender: "female", status: "active" },
      { idx: 10, dept: DEPT_HR,  pos: POS_NV,  name: "Đặng Thu Thảo",     username: "thu.thao",   role: "user",   position: "member",  gender: "female", status: "active" },
      { idx: 11, dept: DEPT_HR,  pos: POS_NV,  name: "Vũ Phương Thảo",    username: "phuong.thao",role: "user",   position: "member",  gender: "female", status: "active" },
      { idx: 12, dept: DEPT_HR,  pos: POS_TTS, name: "Nguyễn Bảo Châu",   username: "bao.chau",   role: "user",   position: "member",  gender: "female", status: "probation" },

      // Kế toán (6)
      { idx: 13, dept: DEPT_ACC, pos: POS_TP,  name: "Vũ Thị Phương",     username: "acc_manager",role: "user",   position: "manager", gender: "female", status: "active" },
      { idx: 14, dept: DEPT_ACC, pos: POS_PP,  name: "Đặng Văn Giang",    username: "dang.giang", role: "user",   position: "member",  gender: "male",   status: "active" },
      { idx: 15, dept: DEPT_ACC, pos: POS_NV,  name: "Đỗ Văn Hoàng",      username: "do.hoang",   role: "user",   position: "member",  gender: "male",   status: "active" },
      { idx: 16, dept: DEPT_ACC, pos: POS_NV,  name: "Ngô Thị Minh",      username: "thi.minh",   role: "user",   position: "member",  gender: "female", status: "active" },
      { idx: 17, dept: DEPT_ACC, pos: POS_NV,  name: "Bùi Thị Mai",       username: "thi.mai",    role: "user",   position: "member",  gender: "female", status: "active" },
      { idx: 18, dept: DEPT_ACC, pos: POS_TTS, name: "Trịnh Văn An",      username: "van.an",     role: "user",   position: "member",  gender: "male",   status: "probation" },

      // Marketing (6)
      { idx: 19, dept: DEPT_MKT, pos: POS_TP,  name: "Bùi Thị Hạnh",      username: "mkt_manager",role: "user",   position: "manager", gender: "female", status: "active" },
      { idx: 20, dept: DEPT_MKT, pos: POS_PP,  name: "Trịnh Thị Ngọc",    username: "trinh.ngoc", role: "user",   position: "member",  gender: "female", status: "active" },
      { idx: 21, dept: DEPT_MKT, pos: POS_NV,  name: "Ngô Văn Inh",       username: "ngo.inh",    role: "user",   position: "member",  gender: "male",   status: "active" },
      { idx: 22, dept: DEPT_MKT, pos: POS_NV,  name: "Lê Mỹ Duyên",       username: "my.duyen",   role: "user",   position: "member",  gender: "female", status: "active" },
      { idx: 23, dept: DEPT_MKT, pos: POS_NV,  name: "Phan Văn Nam",      username: "van.nam",    role: "user",   position: "member",  gender: "male",   status: "active" },
      { idx: 24, dept: DEPT_MKT, pos: POS_TTS, name: "Nguyễn Khánh Linh", username: "khanh.linh", role: "user",   position: "member",  gender: "female", status: "probation" },

      // Vận hành (5)
      { idx: 25, dept: DEPT_OPS, pos: POS_TP,  name: "Lý Văn Minh",       username: "ops_manager",role: "user",   position: "manager", gender: "male",   status: "active" },
      { idx: 26, dept: DEPT_OPS, pos: POS_PP,  name: "Dương Thị Kim",     username: "duong.kim",  role: "user",   position: "member",  gender: "female", status: "active" },
      { idx: 27, dept: DEPT_OPS, pos: POS_NV,  name: "Trần Bảo Nam",      username: "bao.nam",    role: "user",   position: "member",  gender: "male",   status: "active" },
      { idx: 28, dept: DEPT_OPS, pos: POS_NV,  name: "Vũ Hải Yến",        username: "hai.yen",    role: "user",   position: "member",  gender: "female", status: "active" },
      { idx: 29, dept: DEPT_OPS, pos: POS_NV,  name: "Hoàng Gia Bảo",     username: "gia.bao",    role: "user",   position: "member",  gender: "male",   status: "active" },

      // Kỹ thuật (5)
      { idx: 30, dept: DEPT_ENG, pos: POS_TP,  name: "Phan Văn Quốc",     username: "eng_manager",role: "user",   position: "manager", gender: "male",   status: "active" },
      { idx: 31, dept: DEPT_ENG, pos: POS_PP,  name: "Đỗ Quốc Việt",      username: "quoc.viet",  role: "user",   position: "member",  gender: "male",   status: "active" },
      { idx: 32, dept: DEPT_ENG, pos: POS_NV,  name: "Nguyễn Thành Long", username: "thanh.long", role: "user",   position: "member",  gender: "male",   status: "active" },
      { idx: 33, dept: DEPT_ENG, pos: POS_NV,  name: "Trần Thu Trang",    username: "thu.trang",  role: "user",   position: "member",  gender: "female", status: "active" },
      { idx: 34, dept: DEPT_ENG, pos: POS_NV,  name: "Lê Đức Thắng",      username: "duc.thang",  role: "user",   position: "member",  gender: "male",   status: "active" },

      // Thiết kế (6)
      { idx: 35, dept: DEPT_DSG, pos: POS_TP,  name: "Nguyễn Thị Hồng",   username: "dsg_manager",role: "user",   position: "manager", gender: "female", status: "active" },
      { idx: 36, dept: DEPT_DSG, pos: POS_PP,  name: "Trần Đức Huy",      username: "tran.huy",   role: "user",   position: "member",  gender: "male",   status: "active" },
      { idx: 37, dept: DEPT_DSG, pos: POS_NV,  name: "Lê Thị Thanh Tâm",  username: "le.tam",     role: "user",   position: "member",  gender: "female", status: "active" },
      { idx: 38, dept: DEPT_DSG, pos: POS_NV,  name: "Võ Minh Khôi",      username: "vo.khoi",    role: "user",   position: "member",  gender: "male",   status: "active" },
      { idx: 39, dept: DEPT_DSG, pos: POS_NV,  name: "Phạm Hà Phương",    username: "ha.phuong",  role: "user",   position: "member",  gender: "female", status: "active" },
      { idx: 40, dept: DEPT_DSG, pos: POS_TTS, name: "Đặng Hoàng Anh",    username: "hoang.anh",  role: "user",   position: "member",  gender: "male",   status: "probation" },
    ];

    const employees = rawEmployeesData.map((item) => {
      const codeNum = String(item.idx).padStart(3, '0');
      let pwd = "123456";
      if (item.username === "root") pwd = "root123";
      else if (item.username === "admin") pwd = "admin123";
      else if (item.username === "manager") pwd = "manager123";

      return {
        id: EMP[item.idx],
        dept: item.dept,
        pos: item.pos,
        code: `EMP${codeNum}`,
        name: item.name,
        email: `${strip(item.username).toLowerCase()}@teamflow.com`,
        phone: `0901234${codeNum}`,
        birth: `199${(item.idx % 9)}-05-15`,
        hire: "2024-01-15",
        gender: item.gender,
        status: item.status,
        avatar: avatar(item.name),
        username: item.username,
        password: bcrypt.hashSync(pwd, 10),
        role: item.role,
        position: item.position,
        accountStatus: true,
      };
    });

    for (const e of employees) {
      await client.query(
        `INSERT INTO employees (id, department_id, position_id, employee_code, name, email, phone, birth_date, hire_date, gender, status, avatar_url, username, password, role, position, account_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [e.id, e.dept, e.pos, e.code, e.name, e.email, e.phone, e.birth, e.hire, e.gender, e.status, e.avatar, e.username, e.password, e.role, e.position, e.accountStatus]
      );
    }
    console.log(`Inserted ${employees.length} employees (with account credentials)`);

    // ── Update departments with manager_id ──
    await client.query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [EMP[2],  DEPT_IT]);
    await client.query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [EMP[7],  DEPT_HR]);
    await client.query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [EMP[13], DEPT_ACC]);
    await client.query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [EMP[19], DEPT_MKT]);
    await client.query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [EMP[25], DEPT_OPS]);
    await client.query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [EMP[30], DEPT_ENG]);
    await client.query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [EMP[35], DEPT_DSG]);
    console.log("Updated department managers");

    // ── Projects ──
    const projects = [
      { id: PROJ1, title: "Xây dựng website TeamFlow",       desc: "Dự án xây dựng website quản lý công việc nội bộ cho công ty",                              priority: "high",     status: "in_progress", progress: 60,  start: "2025-06-01", due: "2025-09-30", createdBy: EMP[1],  assignedBy: EMP[1],  updatedBy: EMP[2],  est: 500, actual: 280 },
      { id: PROJ2, title: "Phát triển ứng dụng di động",     desc: "Dự án phát triển ứng dụng di động cho khách hàng trên nền tảng iOS và Android",             priority: "medium",   status: "todo",        progress: 0,   start: "2025-08-01", due: "2025-12-31", createdBy: EMP[1],  assignedBy: EMP[1],  est: 800, actual: 0 },
      { id: PROJ3, title: "Nâng cấp hệ thống bảo mật",      desc: "Dự án nâng cấp bảo mật toàn hệ thống CNTT",                                                priority: "critical", status: "review",      progress: 90,  start: "2025-05-01", due: "2025-07-31", createdBy: EMP[2],  assignedBy: EMP[2],  updatedBy: EMP[1],  est: 200, actual: 180 },
      { id: PROJ4, title: "Chiến dịch Marketing Quý 4",      desc: "Chiến dịch truyền thông và quảng bá sản phẩm mới trong quý 4 năm 2025",                    priority: "high",     status: "in_progress", progress: 35,  start: "2025-09-01", due: "2025-11-30", createdBy: EMP[19], assignedBy: EMP[19], updatedBy: EMP[19], est: 300, actual: 100 },
      { id: PROJ5, title: "Tối ưu quy trình vận hành",       desc: "Dự án tối ưu hóa quy trình vận hành doanh nghiệp",                                        priority: "low",      status: "completed",   progress: 100, start: "2025-03-01", due: "2025-06-30", createdBy: EMP[25], assignedBy: EMP[1],  updatedBy: EMP[13], completedBy: EMP[25], est: 150, actual: 140, completedAt: "2025-06-28T00:00:00.000Z" },
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
      { id: PE1,  pid: PROJ1, eid: EMP[1],  role: "manager" },
      { id: PE2,  pid: PROJ1, eid: EMP[2],  role: "reviewer" },
      { id: PE3,  pid: PROJ1, eid: EMP[3],  role: "member" },
      { id: PE4,  pid: PROJ1, eid: EMP[7],  role: "member" },
      { id: PE5,  pid: PROJ2, eid: EMP[1],  role: "manager" },
      { id: PE6,  pid: PROJ2, eid: EMP[3],  role: "member" },
      { id: PE7,  pid: PROJ2, eid: EMP[30], role: "member" },
      { id: PE8,  pid: PROJ3, eid: EMP[2],  role: "manager" },
      { id: PE9,  pid: PROJ3, eid: EMP[1],  role: "reviewer" },
      { id: PE10, pid: PROJ3, eid: EMP[3],  role: "member" },
    ];
    for (const pe of projEmps) {
      await client.query(
        `INSERT INTO project_employees (id, project_id, employee_id, role) VALUES ($1, $2, $3, $4)`,
        [pe.id, pe.pid, pe.eid, pe.role]
      );
    }
    console.log(`Inserted ${projEmps.length} project_employees`);

    // ── Project Departments ──
    const projDepts = [
      { pid: PROJ1, did: DEPT_IT },
      { pid: PROJ1, did: DEPT_HR },
      { pid: PROJ2, did: DEPT_IT },
      { pid: PROJ2, did: DEPT_ENG },
      { pid: PROJ3, did: DEPT_IT },
      { pid: PROJ4, did: DEPT_MKT },
      { pid: PROJ4, did: DEPT_ENG },
      { pid: PROJ5, did: DEPT_OPS },
      { pid: PROJ5, did: DEPT_ACC },
      { pid: PROJ5, did: DEPT_HR },
    ];
    for (const pd of projDepts) {
      await client.query(
        `INSERT INTO project_departments (project_id, department_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [pd.pid, pd.did]
      );
    }
    console.log(`Inserted ${projDepts.length} project_departments`);

    // ── Project Comments ──
    const comments: { id: string; pid: string; eid: string; content: string; attachments?: string }[] = [
      { id: CMT1, pid: PROJ1, eid: EMP[1],  content: "Đã hoàn thành giai đoạn 1 - xây dựng xong giao diện cơ bản. Cần review trước khi sang giai đoạn 2." },
      { id: CMT2, pid: PROJ1, eid: EMP[2],  content: "Đã review giao diện. Có một số điểm cần chỉnh sửa về UX. Sẽ gửi feedback chi tiết sau." },
      { id: CMT3, pid: PROJ3, eid: EMP[2],  content: "Đã nâng cấp firewall và cập nhật chứng chỉ SSL. Cần kiểm tra lại toàn bộ hệ thống." },
    ];
    for (const c of comments) {
      await client.query(
        `INSERT INTO project_comments (id, project_id, employee_id, content, attachments) VALUES ($1, $2, $3, $4, $5)`,
        [c.id, c.pid, c.eid, c.content, c.attachments || null]
      );
    }
    console.log(`Inserted ${comments.length} project_comments`);

    // ── Project Logs ──
    const logs = [
      { id: LOG1, pid: PROJ1, eid: EMP[1],  action: "created",   desc: "Dự án được tạo bởi Nguyễn Văn Anh" },
      { id: LOG2, pid: PROJ1, eid: EMP[1],  action: "assigned",  desc: "Phân công Trần Thị Bích và Lê Văn Cường vào dự án" },
    ];
    for (const l of logs) {
      await client.query(
        `INSERT INTO project_logs (id, project_id, employee_id, action, description) VALUES ($1, $2, $3, $4, $5)`,
        [l.id, l.pid, l.eid, l.action, l.desc]
      );
    }
    console.log(`Inserted ${logs.length} project_logs`);

    await client.query("COMMIT");

    console.log("\n✅ Seed completed successfully!");
    console.log("---");
    console.log(`Summary: ${departments.length} depts, ${positions.length} positions, ${employees.length} employees, ${projects.length} projects`);
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
