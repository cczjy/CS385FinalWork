# pgAdmin4 清除数据库数据指南

## 📋 概述

本指南将教你如何使用 pgAdmin4 清除 PostgreSQL 数据库中的所有数据。

**⚠️ 警告**：以下操作会永久删除所有数据，请谨慎操作！建议先备份数据。

---

## 方法一：使用 pgAdmin4 图形界面（推荐新手）

### 步骤 1：连接到数据库

1. 打开 **pgAdmin 4**
2. 在左侧服务器列表中，找到你的 PostgreSQL 服务器（如 "PostgreSQL 15"）
3. 展开服务器，找到数据库（例如：`teamproject`）
4. 如果还没有连接，右键点击服务器 → **Connect Server**，输入密码

### 步骤 2：打开查询工具

1. 右键点击数据库（例如：`teamproject`）
2. 选择 **Query Tool**（查询工具）
3. 会打开一个 SQL 查询窗口

### 步骤 3：执行清除数据的 SQL

在查询窗口中，复制粘贴以下 SQL 语句：

```sql
-- 清除数据库数据的 SQL 语句
-- 注意：按照外键依赖关系的顺序删除，避免外键约束错误

-- 1. 先删除依赖表的数据（有外键约束的表）
DELETE FROM invitations;
DELETE FROM tasks;
DELETE FROM group_members;

-- 2. 再删除主表的数据
DELETE FROM groups;
DELETE FROM users;

-- 3. 验证是否已清空（可选）
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'groups', COUNT(*) FROM groups
UNION ALL
SELECT 'group_members', COUNT(*) FROM group_members
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'invitations', COUNT(*) FROM invitations;
```

### 步骤 4：执行查询

1. 点击查询窗口上方的 **Execute** 按钮（或按 `F5`）
2. 等待执行完成
3. 如果看到 "DELETE 5" 类似的提示，表示成功删除了5条记录
4. 如果最后一个验证查询返回所有表的 count 都是 0，说明数据已清空

---

## 方法二：使用 Python 脚本（推荐开发者）

### 创建清除脚本

我已经为你创建了一个 `clear_database.py` 脚本，使用方法：

```bash
cd D:\pythonCode\TeamProject
python clear_database.py
```

脚本会：
1. 连接到数据库
2. 按照正确的顺序删除所有数据
3. 显示删除结果
4. 询问是否确认（安全措施）

---

## 方法三：使用 SQL 直接删除表（最彻底的方法）

**⚠️ 注意**：这会删除表结构，之后需要重新运行 `init_db.py` 来创建表。

### 在 pgAdmin4 查询工具中执行：

```sql
-- 删除所有表（包括表结构）
-- 注意：这会删除整个表，而不只是数据

-- 1. 先删除依赖表
DROP TABLE IF EXISTS invitations CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. 重新创建表结构（运行 init_db.py 或执行以下命令）
-- python init_db.py
```

---

## 方法四：逐个表清空（最安全的方法）

如果你想逐个表清空并查看结果：

### 1. 清空 invitations 表

```sql
DELETE FROM invitations;
SELECT COUNT(*) as remaining_count FROM invitations;
```

### 2. 清空 tasks 表

```sql
DELETE FROM tasks;
SELECT COUNT(*) as remaining_count FROM tasks;
```

### 3. 清空 group_members 表

```sql
DELETE FROM group_members;
SELECT COUNT(*) as remaining_count FROM group_members;
```

### 4. 清空 groups 表

```sql
DELETE FROM groups;
SELECT COUNT(*) as remaining_count FROM groups;
```

### 5. 清空 users 表

```sql
DELETE FROM users;
SELECT COUNT(*) as remaining_count FROM users;
```

---

## 验证数据是否已清空

执行以下查询来验证所有表是否为空：

```sql
-- 查看所有表的记录数
SELECT 
    'users' as table_name, 
    COUNT(*) as record_count 
FROM users
UNION ALL
SELECT 'groups', COUNT(*) FROM groups
UNION ALL
SELECT 'group_members', COUNT(*) FROM group_members
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'invitations', COUNT(*) FROM invitations
ORDER BY table_name;
```

如果所有表的 `record_count` 都是 `0`，说明数据已成功清空。

---

## 清空后的操作

数据清空后，你可能需要：

1. **重新初始化数据库表结构**（如果使用了 DROP TABLE）：
   ```bash
   python init_db.py
   ```

2. **重新创建测试数据**（如果需要）：
   - 使用注册接口创建新用户
   - 创建群组和任务等

---

## 常见问题

### Q1: 执行 DELETE 时出现外键约束错误？

**A**: 确保按照正确的顺序删除：
1. 先删除：invitations, tasks, group_members
2. 后删除：groups, users

如果仍然出错，可以使用 `CASCADE` 选项或先禁用外键检查（不推荐）。

### Q2: 如何只删除特定用户的数据？

**A**: 使用 WHERE 条件：

```sql
-- 删除特定用户的所有相关数据
-- 假设用户 email 是 'test@example.com'

-- 1. 获取用户 ID
SELECT id FROM users WHERE email = 'test@example.com';

-- 2. 删除该用户的邀请（发送和接收的）
DELETE FROM invitations 
WHERE inviter_id = (SELECT id FROM users WHERE email = 'test@example.com')
   OR invitee_email = 'test@example.com';

-- 3. 删除该用户创建的任务
DELETE FROM tasks 
WHERE created_by = (SELECT id FROM users WHERE email = 'test@example.com');

-- 4. 删除该用户的群组成员关系
DELETE FROM group_members 
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');

-- 5. 删除该用户拥有的群组（会级联删除相关数据）
DELETE FROM groups 
WHERE owner_id = (SELECT id FROM users WHERE email = 'test@example.com');

-- 6. 最后删除用户
DELETE FROM users WHERE email = 'test@example.com';
```

### Q3: 数据清空后，需要重新运行 init_db.py 吗？

**A**: 
- 如果只使用了 `DELETE` 语句：**不需要**，表结构还在
- 如果使用了 `DROP TABLE`：**需要**，因为表结构被删除了

### Q4: 如何备份数据？

**A**: 在 pgAdmin4 中：
1. 右键点击数据库
2. 选择 **Backup...**
3. 选择备份文件位置
4. 点击 **Backup**

或者在命令行使用 `pg_dump`：
```bash
pg_dump -U user -d teamproject -f backup.sql
```

---

## 快速参考

**清除所有数据的 SQL（一行版本）**：
```sql
DELETE FROM invitations; DELETE FROM tasks; DELETE FROM group_members; DELETE FROM groups; DELETE FROM users;
```

**验证数据已清空**：
```sql
SELECT 'users' as table_name, COUNT(*) FROM users UNION ALL SELECT 'groups', COUNT(*) FROM groups UNION ALL SELECT 'group_members', COUNT(*) FROM group_members UNION ALL SELECT 'tasks', COUNT(*) FROM tasks UNION ALL SELECT 'invitations', COUNT(*) FROM invitations;
```

---

## 安全提示

⚠️ **重要**：
- 在生产环境操作前，**务必先备份数据**
- 确认你连接的是正确的数据库
- 如果不确定，可以先执行 SELECT 查询查看数据
- 建议在测试环境先练习

