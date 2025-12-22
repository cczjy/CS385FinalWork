# PostgreSQL 数据库连接教程

本教程将一步步教你如何使用 pgAdmin4 完成本地数据库与后端的连接。

## 📋 前置准备

### 1. 安装 PostgreSQL

如果还没有安装 PostgreSQL，请先下载安装：

- **Windows**: 访问 https://www.postgresql.org/download/windows/
- 下载 PostgreSQL 安装程序（建议版本 14 或更高）
- 安装时记住设置的 **postgres 用户密码**（这是超级管理员密码）

### 2. 确认 pgAdmin4 已安装

PostgreSQL 安装包通常包含 pgAdmin4。如果没有，可以单独下载：
- 访问 https://www.pgadmin.org/download/

---

## 🚀 步骤一：打开 pgAdmin4

1. 在 Windows 开始菜单搜索 "pgAdmin 4"
2. 首次打开会要求设置主密码（用于保护保存的密码）
3. 设置并记住这个主密码

---

## 🔌 步骤二：连接到本地 PostgreSQL 服务器

1. **查看左侧服务器列表**
   - 展开 "Servers" 节点
   - 通常已经有一个名为 "PostgreSQL 15" 或类似名称的服务器（版本号可能不同）

2. **如果服务器已存在**
   - 双击服务器名称
   - 输入安装时设置的 **postgres 用户密码**
   - 勾选 "Save password"（可选，方便以后使用）

3. **如果服务器不存在，需要添加**
   - 右键点击 "Servers" → "Create" → "Server..."
   - 在 "General" 标签页：
     - Name: `PostgreSQL Local`（任意名称）
   - 在 "Connection" 标签页：
     - Host name/address: `localhost` 或 `127.0.0.1`
     - Port: `5432`（默认端口）
     - Maintenance database: `postgres`
     - Username: `postgres`
     - Password: 输入安装时设置的 postgres 密码
   - 点击 "Save"

4. **连接成功标志**
   - 服务器图标前的红色 X 消失
   - 可以展开服务器看到 "Databases"、"Login/Group Roles" 等节点

---

## 🗄️ 步骤三：创建项目数据库

1. **展开服务器节点**
   - 展开你的 PostgreSQL 服务器
   - 展开 "Databases"

2. **创建新数据库**
   - 右键点击 "Databases" → "Create" → "Database..."
   - 在 "General" 标签页：
     - Database: `teamproject`（与后端配置一致）
     - Owner: `postgres`（默认）
   - 在 "Definition" 标签页：
     - Encoding: `UTF8`（默认）
   - 点击 "Save"

3. **验证数据库创建**
   - 在 "Databases" 下应该能看到 `teamproject` 数据库
   - 双击可以展开查看（目前是空的）

---

## 👤 步骤四：创建专用数据库用户（推荐）

为了安全，建议创建一个专用用户而不是使用 postgres 超级用户。

1. **展开 "Login/Group Roles"**
   - 在服务器下找到 "Login/Group Roles"
   - 右键点击 → "Create" → "Login/Group Role..."

2. **设置用户信息**
   - 在 "General" 标签页：
     - Name: `teamproject_user`（任意用户名）
   - 在 "Definition" 标签页：
     - Password: 设置一个强密码（例如：`TeamProject2024!`）
     - Password expiration: 取消勾选（开发环境）
   - 在 "Privileges" 标签页：
     - 勾选 "Can login?"
     - 勾选 "Create databases?"（可选）
   - 点击 "Save"

3. **授予数据库权限**
   - 展开 "Databases" → 右键点击 `teamproject` → "Properties"
   - 切换到 "Security" 标签页
   - 点击 "Add" 添加权限
   - 在 "Grantee" 下拉选择 `teamproject_user`
   - 勾选所有权限（ALL, CONNECT, CREATE, TEMPORARY）
   - 点击 "Save"

---

## ⚙️ 步骤五：获取连接信息

现在你需要记录以下信息，用于配置后端：

### 方式一：使用 postgres 用户（简单，适合开发）
```
主机: localhost
端口: 5432
数据库名: teamproject
用户名: postgres
密码: [你安装时设置的 postgres 密码]
```

### 方式二：使用专用用户（推荐，更安全）
```
主机: localhost
端口: 5432
数据库名: teamproject
用户名: teamproject_user
密码: [你刚才设置的密码]
```

---

## 🔧 步骤六：配置后端连接

1. **创建 .env 文件**
   - 在项目根目录 `D:\pythonCode\TeamProject\` 创建 `.env` 文件

2. **配置数据库连接字符串**

   如果使用 postgres 用户：
   ```env
   DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/teamproject
   ```

   如果使用专用用户：
   ```env
   DATABASE_URL=postgresql://teamproject_user:你的密码@localhost:5432/teamproject
   ```

   **注意**：如果密码中包含特殊字符（如 `@`, `#`, `$` 等），需要进行 URL 编码：
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`
   - `%` → `%25`
   - `&` → `%26`

3. **完整 .env 文件示例**
   ```env
   # 数据库配置
   DATABASE_URL=postgresql://postgres:MyPassword123@localhost:5432/teamproject
   
   # 应用配置
   DEBUG=True
   APP_NAME=Team Project API
   
   # JWT配置
   SECRET_KEY=your-secret-key-change-this-in-production-please-use-random-string
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   
   # CORS配置
   CORS_ORIGINS=*
   ```

---

## ✅ 步骤七：测试连接

### 方法一：使用 pgAdmin4 测试

1. 在 pgAdmin4 中，右键点击 `teamproject` 数据库
2. 选择 "Query Tool"
3. 输入测试查询：
   ```sql
   SELECT version();
   ```
4. 点击执行按钮（或按 F5）
5. 如果能看到 PostgreSQL 版本信息，说明连接正常

### 方法二：使用 Python 测试

1. **安装依赖**（如果还没安装）：
   ```bash
   cd D:\pythonCode\TeamProject
   pip install -r requirements.txt
   ```

2. **创建测试脚本** `test_connection.py`：
   ```python
   from app.database import engine
   from sqlalchemy import text
   
   try:
       with engine.connect() as conn:
           result = conn.execute(text("SELECT version()"))
           version = result.fetchone()[0]
           print("✅ 数据库连接成功！")
           print(f"PostgreSQL 版本: {version}")
   except Exception as e:
       print("❌ 数据库连接失败！")
       print(f"错误信息: {e}")
   ```

3. **运行测试**：
   ```bash
   python test_connection.py
   ```

### 方法三：启动 FastAPI 应用测试

1. **启动应用**：
   ```bash
   uvicorn main:app --reload
   ```

2. **访问健康检查**：
   - 打开浏览器访问 http://localhost:8000/health
   - 如果返回 `{"status": "healthy"}`，说明应用运行正常

---

## 🔍 常见问题排查

### 问题 1：无法连接到服务器

**症状**：pgAdmin4 显示 "无法连接到服务器"

**解决方案**：
1. 检查 PostgreSQL 服务是否运行
   - 打开 "服务"（services.msc）
   - 查找 "postgresql-x64-xx" 服务
   - 确保状态为 "正在运行"
2. 检查端口是否正确（默认 5432）
3. 检查防火墙设置

### 问题 2：密码错误

**症状**：提示 "password authentication failed"

**解决方案**：
1. 确认使用的是正确的用户密码
2. 如果忘记 postgres 密码，可以重置：
   - 找到 PostgreSQL 的 `pg_hba.conf` 文件
   - 临时修改认证方式为 `trust`
   - 重启服务后可以无密码登录
   - 修改密码后再改回原设置

### 问题 3：数据库不存在

**症状**：后端报错 "database does not exist"

**解决方案**：
1. 在 pgAdmin4 中确认数据库名称拼写正确
2. 确认数据库已创建
3. 检查 `.env` 文件中的 `DATABASE_URL` 是否正确

### 问题 4：权限不足

**症状**：提示 "permission denied"

**解决方案**：
1. 确认用户有访问数据库的权限
2. 在 pgAdmin4 中检查用户权限设置
3. 必要时使用 postgres 超级用户

### 问题 5：连接字符串格式错误

**症状**：Python 报错 "invalid connection string"

**解决方案**：
1. 检查 `DATABASE_URL` 格式：
   ```
   postgresql://用户名:密码@主机:端口/数据库名
   ```
2. 确保密码中的特殊字符已进行 URL 编码
3. 检查是否有多余的空格或换行

---

## 📝 连接信息检查清单

在继续开发前，确认以下信息：

- [ ] PostgreSQL 服务正在运行
- [ ] pgAdmin4 可以连接到本地服务器
- [ ] 已创建 `teamproject` 数据库
- [ ] 已创建数据库用户（或使用 postgres）
- [ ] 用户有访问数据库的权限
- [ ] `.env` 文件已创建并配置正确
- [ ] Python 测试脚本可以成功连接
- [ ] FastAPI 应用可以正常启动

---

## 🎯 下一步

连接成功后，你可以：

1. **创建数据模型**：在 `app/models/` 目录定义数据库表结构
2. **运行迁移**：使用 Alembic 管理数据库迁移（可选）
3. **开发 API**：在 `app/routers/` 目录创建 API 端点

祝你开发顺利！🚀

