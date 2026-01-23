# Expo Group Task App

一个基于 Expo Go 的群组任务管理应用，支持投票任务和讨论任务。

## 功能特性

### 用户认证
-  用户登录
-  用户注册
-  修改密码

### 主仪表板
-  顶部导航栏（首页、筛选、消息、设置）
-  主内容区（首页、群组详情、消息中心、设置页面）

### 群组管理
-  创建群组
-  群组列表（支持筛选：所有群组/我创建的/我管理的/我参与的）
-  群组详情（查看任务、成员、完成度）
-  成员管理（邀请成员、查看成员列表、角色管理）


### 任务系统
-  投票任务
-  讨论任务

### 消息中心
-  群组邀请
-  邀请状态

### 个人设置
-  个人信息
-  语言设置（中英文切换）
-  退出登录

### 其他功能
-  自动刷新（每5分钟自动刷新数据）
-  缓存管理


## 安装和运行

### 前置要求
- Node.js 
- npm 或 yarn
- Expo CLI
- Expo Go 

### 安装步骤

1. 安装依赖
```bash
npm install --legacy-peer-deps
```


1. 启动开发服务器
```bash
npm start
```



1. 在手机上打开 Expo Go 应用，扫描终端显示的二维码

### 使用说明

1. **注册账号**
   - 点击"注册"链接
   - 输入用户名、邮箱、密码（至少6位）
   - 点击"获取验证码"（验证码会以弹窗形式显示）
   - 输入验证码并提交

2. **登录**
   - 使用注册的邮箱和密码登录

3. **创建群组**
   - 在首页点击"创建群组"
   - 输入群组名称和描述
   - 提交创建

4. **管理群组**
   - 点击群组进入详情页
   - 可以邀请成员、创建任务、管理成员

5. **创建任务**
   - 在群组详情页的"任务"标签下
   - 点击"创建任务"
   - 选择任务类型（投票/讨论）
   - 填写任务信息并提交

6. **查看消息**
   - 点击顶部导航的"消息"
   - 查看群组邀请
   - 接受或拒绝邀请

7. **设置**
   - 点击顶部导航的"设置"
   - 可以修改个人信息、切换语言、退出登录



## 技术栈

- React Native 0.81.5
- Expo SDK 54
- React 19.1.0
- React Navigation 7.0
- Expo Blur (毛玻璃效果)
- Expo Linear Gradient (渐变背景)
- Expo Document Picker (文档选择)
- AsyncStorage (本地存储)
- i18n-js (国际化)

## 项目结构

```
├── App.js                    # 主应用入口
├── screens/                  # 屏幕组件
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── ForgotPasswordScreen.js
│   └── DashboardScreen.js
├── components/               # 组件
│   └── Dashboard/           # Dashboard 相关组件
│       ├── TopNavigation.js
│       ├── Sidebar.js
│       ├── HomeView.js
│       ├── GroupDetailView.js
│       ├── MessagesView.js
│       ├── SettingsView.js
│       ├── TaskList.js
│       ├── MemberList.js
│       └── tasks/            # 任务类型组件
│           ├── DocumentTask.js
│           ├── VoteTask.js
│           └── DiscussionTask.js
├── utils/                   # 工具函数
│   ├── storage.js          # 数据存储管理
│   ├── i18n.js             # 国际化配置
│   └── validation.js       # 验证函数
└── package.json
```



