# 快速启动指南

## 🚀 后端启动步骤

### 1. 安装依赖

```bash
cd D:\pythonCode\TeamProject
pip install -r requirements.txt
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/teamproject
SECRET_KEY=your-secret-key-change-this-in-production-please-use-random-string
DEBUG=True
APP_NAME=Team Project API
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=*
```

### 3. 初始化数据库

```bash
python init_db.py
```

这将创建所有必要的数据库表。

### 4. 启动服务器

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```



### 5. 访问 API 文档

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

##  前端对接

### 1. 复制 API 客户端

将 `utils/api.js` 复制到你的前端项目：

```bash
# 从后端项目复制到前端项目
```

### 2. 配置 API 基础 URL

编辑 `utils/api.js`，修改 `API_BASE_URL`：

```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://YOUR_COMPUTER_IP:8000'  // 改为你的电脑 IP 地址
  : 'https://your-api-domain.com';
```


### 3. 在前端使用 API

#### 示例：修改登录功能

```javascript
// screens/LoginScreen.js
import apiClient from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const handleLogin = async () => {
  try {
    const response = await apiClient.login(email, password);
    
    // 保存 token 和用户信息
    await AsyncStorage.setItem('access_token', response.access_token);
    await AsyncStorage.setItem('userData', JSON.stringify(response.user));
    
    // 设置 API 客户端的 token
    apiClient.setToken(response.access_token);
    
    navigation.replace('Dashboard');
  } catch (error) {
    Alert.alert('登录失败', error.message);
  }
};
```

#### 示例：修改注册功能

```javascript
// screens/RegisterScreen.js
import apiClient from '../utils/api';

const handleGetCode = async () => {
  try {
    const response = await apiClient.getVerificationCode(email);
    // 开发环境会返回验证码
    Alert.alert('验证码', response.code);
  } catch (error) {
    Alert.alert('错误', error.message);
  }
};

const handleRegister = async () => {
  try {
    const user = await apiClient.register({
      username,
      email,
      password,
      verification_code: verificationCode
    });
    
    Alert.alert('注册成功', '请登录', [
      { text: '确定', onPress: () => navigation.navigate('Login') }
    ]);
  } catch (error) {
    Alert.alert('注册失败', error.message);
  }
};
```

#### 示例：修改群组功能

```javascript
// components/Dashboard/HomeView.js
import apiClient from '../utils/api';

// 在组件加载时恢复 token
useEffect(() => {
  const restoreToken = async () => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      apiClient.setToken(token);
    }
  };
  restoreToken();
}, []);

const handleCreateGroup = async () => {
  try {
    const newGroup = await apiClient.createGroup({
      name: groupName,
      description: groupDescription
    });
    
    Alert.alert('成功', '群组创建成功');
    setShowCreateModal(false);
    onRefresh(); // 刷新群组列表
  } catch (error) {
    Alert.alert('错误', error.message);
  }
};

// 获取群组列表
const loadGroups = async () => {
  try {
    const groups = await apiClient.getUserGroups();
    setGroups(groups);
  } catch (error) {
    Alert.alert('错误', error.message);
  }
};
```

---

## 🔧 常见问题

### 1. 无法连接到后端

**问题**: 前端无法连接到后端 API

**解决方案**:
- 检查后端是否正在运行（访问 http://localhost:8000/docs）
- 检查 `API_BASE_URL` 是否正确
- 确保手机和电脑在同一 WiFi 网络
- 检查防火墙设置，确保 8000 端口开放
- 尝试使用电脑的 IP 地址而不是 localhost

### 2. 401 未授权错误

**问题**: API 返回 401 错误

**解决方案**:
- 检查 token 是否正确保存和设置
- 确保在每次 API 调用前设置了 token
- Token 可能已过期，需要重新登录

### 3. 数据库连接错误

**问题**: 后端无法连接到数据库

**解决方案**:
- 检查 PostgreSQL 服务是否运行
- 检查 `.env` 文件中的 `DATABASE_URL` 是否正确
- 确保数据库 `teamproject` 已创建
- 参考 `DATABASE_SETUP.md` 进行数据库配置

### 4. CORS 错误

**问题**: 浏览器或移动应用出现 CORS 错误

**解决方案**:
- 检查 `app/config.py` 中的 CORS 配置
- 确保 `.env` 文件中的 `CORS_ORIGINS` 设置正确
- 开发环境可以设置为 `*`（允许所有来源）

---




