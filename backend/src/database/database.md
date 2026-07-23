Enum EUserRole {
  user
  admin
}

Enum ETaskStatus {
  todo
  in_progress
  review
  completed
  cancelled
}

Enum ENotificationType {
    task
    comment
    system
}
Enum EEmployeeStatus {
  active
  probation
  inactive
}

Enum EUserStatus {
  active
  locked
  inactive
}
Enum EPriority {
  low
  medium
  high
  critical
}

Enum EGender {
  male
  female
  other
}
Enum ETaskRole {
  leader
  member
  reviewer
}

ENUM ELevel {
  Intern
  Junior
  Middle
  Senior
  Leader
  Manager
}

ENUM ETaskAction {
  created
  updated
  assigned
  commented
  completed
  cancelled
}

Table User {
  id string [pk]
  employeeId string [unique, not null]
  username varchar [unique, not null]
  password varchar [not null]
  role EUserRole [default: 'user', not null]
  status EUserStatus [default: 'active', not null]
  lastLogin timestamp
  createdAt timestamp
  updatedAt timestamp
}
Table departments {
  id string [pk]
  name string [unique]
  code string [unique]
  description  string
  managerId string 
  isActive boolean
  createdAt timestamp
  updatedAt timestamp
}

Table employees {
  id string [pk]
  departmentId string [not null]
  positionId string [not null]
  employeeCode varchar [unique, not null]
  name string [not null]
  email string [unique, not null]
  phone varchar [unique]
  birthDate date
  hireDate date
  gender EGender [default: 'other']
  status EEmployeeStatus [default: 'active']
  avatarURL varchar
  createdAt timestamp
  updatedAt timestamp
}

Table positions {
  id string [pk]
  name varchar [unique]
  description text
  level ELevel
  createdAt timestamp
  updatedAt timestamp
} 

Table tasks {
  id string [pk]
  title varchar [not null]
  description text
  priority EPriority [default:'medium']
  status ETaskStatus [default:'todo']
  progress int [default:0, note:'0-100']
  startDate date
  dueDate date
  assignedBy string
  createdBy string [not null]
  updatedBy string
  completedBy string
  estimatedHours int
  actualHours int
  completedAt timestamp
  createdAt timestamp
  updatedAt timestamp
}

Table task_employees {
  id string [pk]
  taskId string [not null]
  employeeId string [not null]
  role ETaskRole [default : 'member']
  assignedAt timestamp
}

Table task_comments {
  id string [pk]
  taskId string [not null]
  employeeId string [not null]
  content string
  attachments text
  createdAt timestamp
  updatedAt timestamp
}



Table task_departments {
  id string [not null]
  taskId string [not null]
  departmentId string [not null]
  assignedAt timestamp

  Note: 'PK(taskId, departmentId)'
}

Table task_logs  {
  id string [pk]
  taskId string [not null]
  employeeId string [not null]
  action ETaskAction
  description text
  createdAt timestamp
}

Ref: User.employeeId > employees.id

Ref: employees.departmentId > departments.id
Ref: employees.positionId > positions.id

Ref: departments.managerId > employees.id

Ref: tasks.createdBy > employees.id
Ref: tasks.updatedBy > employees.id
Ref: tasks.assignedBy > employees.id
Ref: tasks.completedBy > employees.id

Ref: task_employees.taskId > tasks.id
Ref: task_employees.employeeId > employees.id

Ref: task_comments.taskId > tasks.id
Ref: task_comments.employeeId > employees.id

Ref: task_departments.taskId > tasks.id
Ref: task_departments.departmentId > departments.id

Ref: task_logs.taskId > tasks.id
Ref: task_logs.employeeId > employees.id
