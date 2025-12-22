# API 文档

本文档描述了群组任务管理系统的所有 API 端点。

**基础 URL**: `http://localhost:8000` (开发环境)

**认证方式**: Bearer Token (JWT)

---

## 📋 目录

- [认证 API](#认证-api)
- [群组 API](#群组-api)
- [任务 API](#任务-api)
- [邀请 API](#邀请-api)

---

## 🔐 认证 API

### 1. 获取验证码

**端点**: `POST /api/auth/verification-code`

**请求体**:
```json
{
  "email": "user@example.com"
}
```

**响应**:
```json
{
  "message": "验证码已生成（开发环境）",
  "code": "123456"
}
```

---

### 2. 用户注册

**端点**: `POST /api/auth/register`

**请求体**:
```json
{
  "username": "张三",
  "email": "user@example.com",
  "password": "password123",
  "verification_code": "123456"
}
```

**响应**:
```json
{
  "id": "uuid",
  "username": "张三",
  "email": "user@example.com",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00"
}
```

---

### 3. 用户登录

**端点**: `POST /api/auth/login`

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "username": "张三",
    "email": "user@example.com",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00"
  }
}
```

**注意**: 登录后需要在后续请求的 Header 中添加：
```
Authorization: Bearer {access_token}
```

---

### 4. 获取当前用户信息

**端点**: `GET /api/auth/me`

**认证**: 需要 Bearer Token

**响应**:
```json
{
  "id": "uuid",
  "username": "张三",
  "email": "user@example.com",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00"
}
```

---

## 👥 群组 API

### 1. 创建群组

**端点**: `POST /api/groups`

**认证**: 需要 Bearer Token

**请求体**:
```json
{
  "name": "项目组",
  "description": "这是一个项目组"
}
```

**响应**:
```json
{
  "id": "uuid",
  "name": "项目组",
  "description": "这是一个项目组",
  "owner_id": "user_uuid",
  "created_at": "2024-01-01T00:00:00",
  "members": [
    {
      "id": "member_uuid",
      "user_id": "user_uuid",
      "role": "owner",
      "joined_at": "2024-01-01T00:00:00",
      "username": "张三",
      "email": "user@example.com"
    }
  ],
  "member_count": 1
}
```

---

### 2. 获取用户的群组列表

**端点**: `GET /api/groups`

**认证**: 需要 Bearer Token

**响应**:
```json
[
  {
    "id": "uuid",
    "name": "项目组",
    "description": "这是一个项目组",
    "owner_id": "user_uuid",
    "created_at": "2024-01-01T00:00:00",
    "members": [...],
    "member_count": 5
  }
]
```

---

### 3. 获取群组详情

**端点**: `GET /api/groups/{group_id}`

**认证**: 需要 Bearer Token

**响应**: 同创建群组的响应格式

---

### 4. 更新群组信息

**端点**: `PUT /api/groups/{group_id}`

**认证**: 需要 Bearer Token（仅群主或管理员）

**请求体**:
```json
{
  "name": "新名称",
  "description": "新描述"
}
```

**响应**: 同创建群组的响应格式

---

### 5. 获取群组成员列表

**端点**: `GET /api/groups/{group_id}/members`

**认证**: 需要 Bearer Token

**响应**:
```json
[
  {
    "id": "member_uuid",
    "user_id": "user_uuid",
    "role": "owner",
    "joined_at": "2024-01-01T00:00:00",
    "username": "张三",
    "email": "user@example.com"
  }
]
```

---

## 📝 任务 API

### 1. 创建任务

**端点**: `POST /api/tasks`

**认证**: 需要 Bearer Token

**请求体**:
```json
{
  "group_id": "group_uuid",
  "type": "document",  // "document", "vote", "discussion"
  "title": "任务标题",
  "description": "任务描述"
}
```

**响应**:
```json
{
  "id": "task_uuid",
  "group_id": "group_uuid",
  "type": "document",
  "title": "任务标题",
  "description": "任务描述",
  "created_by": "user_uuid",
  "created_at": "2024-01-01T00:00:00",
  "document_url": null,
  "document_name": null,
  "options": [],
  "votes": {},
  "comments": [],
  "completed_by": []
}
```

---

### 2. 获取群组任务列表

**端点**: `GET /api/tasks/group/{group_id}`

**认证**: 需要 Bearer Token

**响应**:
```json
[
  {
    "id": "task_uuid",
    "group_id": "group_uuid",
    "type": "document",
    "title": "任务标题",
    ...
  }
]
```

---

### 3. 获取任务详情

**端点**: `GET /api/tasks/{task_id}`

**认证**: 需要 Bearer Token

**响应**: 同创建任务的响应格式

---

### 4. 更新任务

**端点**: `PUT /api/tasks/{task_id}`

**认证**: 需要 Bearer Token（仅创建者或群主/管理员）

**请求体**:
```json
{
  "title": "新标题",
  "description": "新描述",
  "document_url": "http://example.com/file.pdf",
  "document_name": "文件.pdf",
  "options": [
    {"id": "1", "text": "选项1"},
    {"id": "2", "text": "选项2"}
  ]
}
```

**响应**: 同创建任务的响应格式

---

### 5. 标记任务完成

**端点**: `POST /api/tasks/{task_id}/complete`

**认证**: 需要 Bearer Token

**响应**:
```json
{
  "message": "任务已标记为完成",
  "task": { ... }
}
```

---

### 6. 投票

**端点**: `POST /api/tasks/{task_id}/vote`

**认证**: 需要 Bearer Token（仅投票任务）

**请求体**:
```json
{
  "option_id": "1"
}
```

**响应**:
```json
{
  "message": "投票成功",
  "task": { ... }
}
```

---

### 7. 添加评论

**端点**: `POST /api/tasks/{task_id}/comment`

**认证**: 需要 Bearer Token（仅讨论任务）

**请求体**:
```json
{
  "text": "这是一条评论",
  "parent_id": null  // 可选，用于回复评论
}
```

**响应**:
```json
{
  "message": "评论添加成功",
  "task": { ... }
}
```

---

## 📧 邀请 API

### 1. 创建邀请

**端点**: `POST /api/invitations`

**认证**: 需要 Bearer Token（仅群主或管理员）

**请求体**:
```json
{
  "group_id": "group_uuid",
  "invitee_email": "invitee@example.com"
}
```

**响应**:
```json
{
  "id": "invitation_uuid",
  "group_id": "group_uuid",
  "group_name": "项目组",
  "inviter_id": "user_uuid",
  "inviter_username": "张三",
  "invitee_email": "invitee@example.com",
  "status": "pending",
  "created_at": "2024-01-01T00:00:00"
}
```

---

### 2. 获取用户的邀请列表

**端点**: `GET /api/invitations`

**认证**: 需要 Bearer Token

**响应**:
```json
[
  {
    "id": "invitation_uuid",
    "group_id": "group_uuid",
    "group_name": "项目组",
    "inviter_id": "user_uuid",
    "inviter_username": "张三",
    "invitee_email": "user@example.com",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00"
  }
]
```

---

### 3. 更新邀请状态

**端点**: `PUT /api/invitations/{invitation_id}`

**认证**: 需要 Bearer Token

**请求体**:
```json
{
  "status": "accepted"  // 或 "rejected"
}
```

**响应**: 同创建邀请的响应格式

**注意**: 接受邀请后，用户会自动加入群组

---

## 🔒 权限说明

### 群组权限

- **owner (群主)**: 拥有所有权限
- **admin (管理员)**: 可以管理群组、任务和邀请成员
- **member (成员)**: 可以查看和参与任务

### 任务权限

- **创建者**: 可以修改自己创建的任务
- **群主/管理员**: 可以修改所有任务
- **所有成员**: 可以查看和参与任务

---

## ❌ 错误响应

所有错误响应都遵循以下格式：

```json
{
  "detail": "错误描述信息"
}
```

常见 HTTP 状态码：

- `200`: 成功
- `201`: 创建成功
- `400`: 请求错误（参数错误、验证失败等）
- `401`: 未授权（需要登录或 token 无效）
- `403`: 禁止访问（权限不足）
- `404`: 资源不存在
- `500`: 服务器错误

---

## 📝 使用示例

### JavaScript/React Native 示例

```javascript
import apiClient from './utils/api';

// 登录
const loginResponse = await apiClient.login('user@example.com', 'password123');
apiClient.setToken(loginResponse.access_token);

// 创建群组
const group = await apiClient.createGroup({
  name: '项目组',
  description: '这是一个项目组'
});

// 获取群组列表
const groups = await apiClient.getUserGroups();

// 创建任务
const task = await apiClient.createTask({
  group_id: group.id,
  type: 'document',
  title: '任务标题',
  description: '任务描述'
});
```

---

## 🚀 快速开始

1. **启动后端服务器**:
   ```bash
   cd D:\pythonCode\TeamProject
   uvicorn main:app --reload
   ```

2. **初始化数据库**:
   ```bash
   python init_db.py
   ```

3. **访问 API 文档**:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

4. **在前端使用 API 客户端**:
   ```javascript
   import apiClient from './utils/api';
   ```

---

## 📞 注意事项

1. **开发环境配置**: 
   - 如果手机和电脑不在同一网络，需要将 `API_BASE_URL` 改为电脑的 IP 地址
   - 例如：`http://192.168.1.100:8000`

2. **Token 管理**:
   - 登录后保存 token 到 AsyncStorage
   - 每次应用启动时恢复 token
   - Token 过期后需要重新登录

3. **错误处理**:
   - 所有 API 调用都应该使用 try-catch
   - 处理 401 错误时清除 token 并跳转到登录页

4. **文件上传**:
   - 文档任务的文件上传需要单独实现
   - 建议使用 `FormData` 和文件上传端点

---

**最后更新**: 2024-01-01

