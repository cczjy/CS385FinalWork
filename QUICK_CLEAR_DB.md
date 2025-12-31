# 快速清除数据库数据指南

## 🚀 最快方法（推荐）

### 使用 Python 脚本

```bash
cd D:\pythonCode\TeamProject
python clear_database.py
```

脚本会：
1. 显示当前数据统计
2. 要求你确认（输入 `yes`）
3. 按照正确顺序删除所有数据
4. 显示删除结果

---

## 📋 pgAdmin4 方法

### 步骤 1：打开 pgAdmin4
1. 打开 pgAdmin 4
2. 连接到你的数据库服务器
3. 找到数据库（例如：`teamproject`）

### 步骤 2：打开查询工具
1. 右键点击数据库
2. 选择 **Query Tool**

### 步骤 3：执行 SQL

复制粘贴以下 SQL，然后点击 **Execute**（或按 F5）：

```sql
-- 清除所有数据
DELETE FROM invitations;
DELETE FROM tasks;
DELETE FROM group_members;
DELETE FROM groups;
DELETE FROM users;
```

### 步骤 4：验证

执行以下查询，确认所有表都是空的：

```sql
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'groups', COUNT(*) FROM groups
UNION ALL SELECT 'group_members', COUNT(*) FROM group_members
UNION ALL SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL SELECT 'invitations', COUNT(*) FROM invitations;
```

如果所有 count 都是 0，说明数据已清空 ✅

---

## ⚠️ 重要提示

- **清除数据后**，你需要重新注册用户
- **表结构不会被删除**，无需重新运行 `init_db.py`
- **建议先备份数据**（如果需要）

---

## 📚 详细文档

- 完整指南：`CLEAR_DATABASE_GUIDE.md`
- 加密问题修复：`FIX_ENCRYPTION_ISSUE.md`

