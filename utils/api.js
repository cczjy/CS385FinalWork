/**
 * API 客户端
 * 用于与后端 FastAPI 通信
 */

// 配置 API 基础 URL
// 
// 重要说明：
// - 如果使用真机（Expo Go），必须使用电脑的实际 IP 地址
// - 如果使用模拟器，可以使用 localhost 或特殊地址
// 
// 当前配置：使用电脑 IP 地址（适用于真机和模拟器）
// 如果连接失败，请检查：
// 1. 后端是否运行：uvicorn main:app --reload --host 0.0.0.0
// 2. 手机和电脑是否在同一 WiFi
// 3. 防火墙是否允许 8000 端口

import { Platform } from 'react-native';

// 电脑的 IP 地址（根据你的网络环境修改）
const COMPUTER_IP = '192.168.4.23';

const getApiBaseUrl = () => {
  if (!__DEV__) {
    return 'https://your-api-domain.com';
  }
  
  // 开发环境
  if (Platform.OS === 'android') {
    // Android：优先使用实际 IP（适用于真机和模拟器）
    // 如果模拟器无法连接，可以尝试改为 'http://10.0.2.2:8000'
    return `http://${COMPUTER_IP}:8000`;
  } else if (Platform.OS === 'ios') {
    // iOS：使用实际 IP（真机必须）
    // 如果是 iOS 模拟器且无法连接，可以尝试改为 'http://localhost:8000'
    return `http://${COMPUTER_IP}:8000`;
  } else {
    // Web 平台：使用 localhost
    return 'http://localhost:8000';
  }
};

const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  /**
   * 设置认证 token
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * 清除 token
   */
  clearToken() {
    this.token = null;
  }

  /**
   * 构建请求头
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * 通用请求方法
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      console.log('🌐 API Request:', config.method || 'GET', url);
      const response = await fetch(url, config);
      
      // 检查响应内容类型
      const contentType = response.headers.get('content-type');
      let data;
      
      // 先获取响应文本
      const text = await response.text();
      
      // 尝试解析为 JSON
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        // 如果不是 JSON，检查是否是 HTML 错误页面
        if (text.includes('<html>') || text.includes('<!DOCTYPE')) {
          // 提取错误信息（如果有）
          const errorMatch = text.match(/<title>(.*?)<\/title>/i) || text.match(/<h1>(.*?)<\/h1>/i);
          const errorMsg = errorMatch ? errorMatch[1] : '服务器返回了 HTML 错误页面';
          throw new Error(`服务器错误: ${errorMsg}。请检查后端日志获取详细信息。`);
        }
        throw new Error(`服务器返回了非 JSON 数据: ${text.substring(0, 200)}`);
      }

      if (!response.ok) {
        throw new Error(data.detail || data.message || `HTTP error! status: ${response.status}`);
      }

      console.log('✅ API Response:', data);
      return data;
    } catch (error) {
      console.error('❌ API Request Error:', error);
      console.error('📍 Request URL:', url);
      console.error('📍 API Base URL:', this.baseURL);
      
      // 提供更友好的错误信息
      let errorMessage = error.message;
      if (error.message === 'Network request failed' || error.message.includes('NetworkError')) {
        errorMessage = `无法连接到服务器 (${this.baseURL})\n\n请检查：\n1. 后端服务器是否正在运行\n2. 手机和电脑是否在同一 WiFi 网络\n3. 防火墙是否允许 8000 端口\n4. 如果使用真机，确保使用电脑的 IP 地址而不是 localhost`;
      }
      
      throw new Error(errorMessage);
    }
  }

  // ==================== 认证相关 ====================

  /**
   * 获取验证码
   */
  async getVerificationCode(email) {
    return this.request('/api/auth/verification-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * 用户注册
   */
  async register(userData) {
    const response = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response;
  }

  /**
   * 用户登录（简化版，直接返回用户信息）
   */
  async login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  /**
   * 根据用户ID获取用户信息
   */
  async getUserById(userId) {
    return this.request(`/api/auth/user/${userId}`);
  }

  // ==================== 群组相关 ====================

  /**
   * 创建群组
   */
  async createGroup(groupData, userId) {
    return this.request(`/api/groups?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  /**
   * 获取用户的群组列表
   */
  async getUserGroups(userId) {
    return this.request(`/api/groups?user_id=${userId}`);
  }

  /**
   * 获取群组详情
   */
  async getGroup(groupId, userId = null) {
    const url = userId ? `/api/groups/${groupId}?user_id=${userId}` : `/api/groups/${groupId}`;
    return this.request(url);
  }

  /**
   * 更新群组信息
   */
  async updateGroup(groupId, groupData, userId) {
    return this.request(`/api/groups/${groupId}?user_id=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(groupData),
    });
  }

  /**
   * 获取群组成员列表
   */
  async getGroupMembers(groupId, userId = null) {
    const url = userId ? `/api/groups/${groupId}/members?user_id=${userId}` : `/api/groups/${groupId}/members`;
    return this.request(url);
  }

  // ==================== 任务相关 ====================

  /**
   * 创建任务
   */
  async createTask(taskData, userId) {
    return this.request(`/api/tasks?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  /**
   * 获取群组任务列表
   */
  async getGroupTasks(groupId, userId = null) {
    const url = userId ? `/api/tasks/group/${groupId}?user_id=${userId}` : `/api/tasks/group/${groupId}`;
    return this.request(url);
  }

  /**
   * 获取任务详情
   */
  async getTask(taskId, userId = null) {
    const url = userId ? `/api/tasks/${taskId}?user_id=${userId}` : `/api/tasks/${taskId}`;
    return this.request(url);
  }

  /**
   * 更新任务
   */
  async updateTask(taskId, taskData, userId) {
    return this.request(`/api/tasks/${taskId}?user_id=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  /**
   * 标记任务完成
   */
  async completeTask(taskId, userId) {
    return this.request(`/api/tasks/${taskId}/complete?user_id=${userId}`, {
      method: 'POST',
    });
  }

  /**
   * 投票
   */
  async voteTask(taskId, optionId, userId) {
    return this.request(`/api/tasks/${taskId}/vote?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify({ option_id: optionId }),
    });
  }

  /**
   * 添加评论
   */
  async addComment(taskId, text, userId, parentId = null) {
    return this.request(`/api/tasks/${taskId}/comment?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify({ text, parent_id: parentId }),
    });
  }

  // ==================== 邀请相关 ====================

  /**
   * 创建邀请
   */
  async createInvitation(invitationData, userId) {
    return this.request(`/api/invitations?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(invitationData),
    });
  }

  /**
   * 获取用户的邀请列表
   */
  async getUserInvitations(userEmail) {
    return this.request(`/api/invitations?user_email=${encodeURIComponent(userEmail)}`);
  }

  /**
   * 更新邀请状态（接受或拒绝）
   */
  async updateInvitation(invitationId, status, userEmail) {
    return this.request(`/api/invitations/${invitationId}?user_email=${encodeURIComponent(userEmail)}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
}

// 创建单例实例
const apiClient = new ApiClient();

export default apiClient;

