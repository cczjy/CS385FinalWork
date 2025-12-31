# pgAdmin 使用指南 - 查看数据库表

## 1. 连接到数据库

1. 打开 **pgAdmin 4**
2. 在左侧服务器列表中，找到你的 PostgreSQL 服务器（通常是 "PostgreSQL 15" 或类似名称）
3. 展开服务器，找到你的数据库（例如：`teamproject`）
4. 如果还没有连接，右键点击服务器 → **Connect Server**，输入密码

## 2. 查看数据库表

### 方法一：通过图形界面

1. 展开数据库（例如：`teamproject`）
2. 展开 **Schemas** 文件夹
3. 展开 **public** 文件夹（默认架构）
4. 展开 **Tables** 文件夹
5. 你会看到所有表：
   - `users` - 用户表
   - `groups` - 群组表
   - `group_members` - 群组成员表
   - `tasks` - 任务表
   - `invitations` - 邀请表

### 方法二：使用查询工具

1. 右键点击数据库（例如：`teamproject`）
2. 选择 **Query Tool**
3. 在查询窗口中输入以下 SQL：

```sql
-- 查看所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 查看 users 表的所有数据
SELECT * FROM users;

-- 查看 groups 表的所有数据
SELECT * FROM groups;

-- 查看 group_members 表的所有数据
SELECT * FROM group_members;

-- 查看 tasks 表的所有数据
SELECT * FROM tasks;

-- 查看 invitations 表的所有数据
SELECT * FROM invitations;
```

## 3. 查看表结构

1. 在 **Tables** 文件夹中，找到你想查看的表（例如：`users`）
2. 右键点击表名
3. 选择 **View/Edit Data** → **All Rows** 查看数据
4. 或者选择 **Properties** 查看表结构

## 4. 查看表数据

### 查看 users 表（用户表）
```sql
SELECT id, username, email, hashed_password, is_active, created_at 
FROM users;
```

### 查看 groups 表（群组表）
```sql
SELECT id, name, description, owner_id, created_at 
FROM groups;
```

### 查看 group_members 表（群组成员表）
```sql
SELECT id, group_id, user_id, role, joined_at 
FROM group_members;
```

### 查看 tasks 表（任务表）
```sql
SELECT id, group_id, type, title, description, created_by, created_at 
FROM tasks;
```

### 查看 invitations 表（邀请表）
```sql
SELECT id, group_id, inviter_id, invitee_email, status, created_at 
FROM invitations;
```

## 5. 常用操作

### 清空表数据（谨慎使用！）
```sql
-- 清空所有表（按顺序删除，避免外键约束错误）
DELETE FROM invitations;
DELETE FROM tasks;
DELETE FROM group_members;
DELETE FROM groups;
DELETE FROM users;
```

### 查看特定用户的数据
```sql
-- 查看用户及其群组
SELECT u.id, u.username, u.email, g.name as group_name, gm.role
FROM users u
LEFT JOIN group_members gm ON u.id = gm.user_id
LEFT JOIN groups g ON gm.group_id = g.id
WHERE u.email = 'your-email@example.com';
```

### 查看群组及其成员
```sql
-- 查看群组及其所有成员
SELECT g.id, g.name, u.username, u.email, gm.role
FROM groups g
JOIN group_members gm ON g.id = gm.group_id
JOIN users u ON gm.user_id = u.id
WHERE g.id = 'your-group-id';
```

## 6. 注意事项

⚠️ **重要提示**：
- 在生产环境中，密码应该加密存储
- 当前测试模式中，密码以明文形式存储在 `hashed_password` 字段中
- 不要在生产环境中使用明文密码！

## 7. 快速定位表的位置

**完整路径**：
```
服务器 → Databases → teamproject → Schemas → public → Tables → [表名]
```

**快捷键**：
- 按 `F5` 刷新
- 按 `Ctrl+Shift+Q` 打开查询工具
- 按 `F5` 执行查询

