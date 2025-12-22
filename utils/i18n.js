import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

// 安全获取语言设置
const getLocale = () => {
  try {
    // 尝试获取 locale
    let locale = null;
    
    // 方法1: 直接获取 locale (同步)
    if (Localization.locale && typeof Localization.locale === 'string') {
      locale = Localization.locale;
    }
    // 方法2: 使用 getLocales (如果 locale 不存在)
    else if (Localization.getLocales) {
      try {
        const locales = Localization.getLocales();
        if (locales && locales.length > 0) {
          locale = locales[0].languageCode || locales[0].languageTag;
        }
      } catch (e) {
        // 忽略错误
      }
    }
    
    // 如果成功获取到 locale，提取语言代码
    if (locale && typeof locale === 'string') {
      const parts = locale.split('-');
      return parts[0] || 'en';
    }
  } catch (error) {
    console.warn('Error getting locale:', error);
  }
  // 默认返回英文
  return 'en';
};

// 翻译文本
const translations = {
  en: {
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    username: 'Username',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password',
    changePassword: 'Change Password',
    oldPassword: 'Old Password',
    newPassword: 'New Password',
    verificationCode: 'Verification Code',
    getCode: 'Get Code',
    submit: 'Submit',
    cancel: 'Cancel',
    dashboard: 'Dashboard',
    groups: 'Groups',
    messages: 'Messages',
    settings: 'Settings',
    createGroup: 'Create Group',
    groupName: 'Group Name',
    description: 'Description',
    members: 'Members',
    tasks: 'Tasks',
    invite: 'Invite',
    accept: 'Accept',
    reject: 'Reject',
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    logout: 'Logout',
    language: 'Language',
    chinese: 'Chinese',
    english: 'English',
    documentTask: 'Document Task',
    voteTask: 'Vote Task',
    discussionTask: 'Discussion Task',
    createTask: 'Create Task',
    title: 'Title',
    upload: 'Upload',
    download: 'Download',
    vote: 'Vote',
    comment: 'Comment',
    reply: 'Reply',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    allGroups: 'All Groups',
    myGroups: 'My Groups',
    managedGroups: 'Managed Groups',
    joinedGroups: 'Joined Groups',
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
    promote: 'Promote',
    demote: 'Demote',
    remove: 'Remove',
    completion: 'Completion',
    progress: 'Progress',
  },
  zh: {
    login: '登录',
    register: '注册',
    email: '邮箱',
    password: '密码',
    username: '用户名',
    confirmPassword: '确认密码',
    forgotPassword: '忘记密码',
    changePassword: '修改密码',
    oldPassword: '原密码',
    newPassword: '新密码',
    verificationCode: '验证码',
    getCode: '获取验证码',
    submit: '提交',
    cancel: '取消',
    dashboard: '仪表板',
    groups: '群组',
    messages: '消息',
    settings: '设置',
    createGroup: '创建群组',
    groupName: '群组名称',
    description: '描述',
    members: '成员',
    tasks: '任务',
    invite: '邀请',
    accept: '接受',
    reject: '拒绝',
    pending: '待处理',
    accepted: '已接受',
    rejected: '已拒绝',
    logout: '退出登录',
    language: '语言',
    chinese: '中文',
    english: '英文',
    documentTask: '文档任务',
    voteTask: '投票任务',
    discussionTask: '讨论任务',
    createTask: '创建任务',
    title: '标题',
    upload: '上传',
    download: '下载',
    vote: '投票',
    comment: '评论',
    reply: '回复',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    search: '搜索',
    allGroups: '所有群组',
    myGroups: '我创建的',
    managedGroups: '我管理的',
    joinedGroups: '我参与的',
    owner: '群主',
    admin: '管理员',
    member: '普通成员',
    promote: '提升',
    demote: '降级',
    remove: '移除',
    completion: '完成度',
    progress: '进度',
  },
};

const i18n = new I18n(translations);
i18n.locale = getLocale();
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;

