# 修复加密问题指南

## 问题分析

你提到在禁用加密安全功能后，数据库数据传给后端以及前端获取出现问题。这通常是因为：

1. **数据库中已有加密的密码**（之前启用加密时存储的）
2. **代码现在使用明文比较**（禁用加密后）
3. **密码验证失败**，导致登录和认证出现问题

---

## 解决方案

### 方案一：清除数据库数据（推荐，简单快速）

如果你只是想快速恢复，最简单的方法是清除所有数据，然后重新创建用户。

#### 使用 Python 脚本（推荐）

```bash
cd D:\pythonCode\TeamProject
python clear_database.py
```

#### 使用 pgAdmin4

详见 `CLEAR_DATABASE_GUIDE.md` 文件。

---

### 方案二：修复代码以兼容新旧数据（如果你需要保留数据）

如果你有重要数据需要保留，可以修改 `app/auth.py` 使其能够同时处理加密和明文密码：

我已经创建了 `app/auth_fixed.py` 作为参考。你可以：

1. **查看修复版本的代码**：`app/auth_fixed.py`
2. **如果不需要加密**：保持当前的 `app/auth.py`（明文），但需要清除数据库
3. **如果需要重新启用加密**：替换 `app/auth.py` 的内容

---

## 当前代码状态

### `app/auth.py`（当前版本 - 已禁用加密）

```python
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码（测试模式：直接比较明文，不加密）"""
    return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    """加密密码（测试模式：直接返回明文，不加密）"""
    return password
```

**问题**：如果数据库中有加密的密码（之前存储的），这段代码无法验证。

---

## 推荐操作步骤

### 步骤 1：清除数据库数据

```bash
# 方法1：使用 Python 脚本（推荐）
python clear_database.py

# 方法2：使用 pgAdmin4（见 CLEAR_DATABASE_GUIDE.md）
```

### 步骤 2：确认代码配置

当前的 `app/auth.py` 使用明文密码，这是可以的（仅用于开发测试）。

如果你想重新启用加密，可以：

1. **备份当前的 auth.py**：
   ```bash
   copy app\auth.py app\auth_backup.py
   ```

2. **查看修复版本**（`app/auth_fixed.py`），它支持：
   - 如果有 bcrypt，使用加密
   - 如果没有 bcrypt，使用明文（兼容性）

3. **或者直接修改 `app/auth.py`**，使用 `app/auth_fixed.py` 的内容

### 步骤 3：重新初始化（如果需要）

清除数据后，表结构还在，不需要重新初始化。如果需要重建表结构：

```bash
python init_db.py
```

### 步骤 4：测试

1. 启动后端服务器
2. 使用前端注册新用户
3. 尝试登录

---

## 代码修改说明

### 如果保持明文密码（当前状态）

无需修改代码，只需清除数据库数据即可。

### 如果重新启用加密

需要修改 `app/auth.py`，使用 `passlib[bcrypt]` 进行加密。

**注意**：`requirements.txt` 中已经包含了 `passlib[bcrypt]==1.7.4`，所以依赖已经安装了。

---

## 验证步骤

清除数据后，验证数据库是否为空：

### 使用 Python 脚本

运行 `clear_database.py` 后，它会显示统计信息。

### 使用 pgAdmin4

在查询工具中执行：

```sql
SELECT 
    'users' as table_name, 
    COUNT(*) as count 
FROM users
UNION ALL
SELECT 'groups', COUNT(*) FROM groups
UNION ALL
SELECT 'group_members', COUNT(*) FROM group_members
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'invitations', COUNT(*) FROM invitations;
```

所有表的 count 应该是 0。

---

## 常见问题

### Q1: 清除数据后，需要重新运行 init_db.py 吗？

**A**: 不需要。`DELETE` 语句只删除数据，不删除表结构。只有使用 `DROP TABLE` 才需要重新初始化。

### Q2: 如何确认代码使用的是明文还是加密？

**A**: 查看 `app/auth.py` 中的 `get_password_hash` 函数：
- 如果返回 `password`（明文），则未加密
- 如果返回 `pwd_context.hash(password)`（加密），则已加密

### Q3: 数据库中有混合的加密和明文密码怎么办？

**A**: 最简单的解决方案是清除所有数据，重新开始。或者使用 `auth_fixed.py` 中的兼容性代码。

---

## 总结

**推荐操作**：

1. ✅ 运行 `python clear_database.py` 清除所有数据
2. ✅ 保持当前的 `app/auth.py`（明文，适合开发测试）
3. ✅ 重新注册用户测试

**如果未来需要启用加密**：

1. 修改 `app/auth.py` 使用 bcrypt（参考 `auth_fixed.py`）
2. 清除数据库数据（因为旧密码是明文的）
3. 重新注册用户

