
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000'  // 开发环境，如果手机和电脑不在同一网络，需要改为电脑的 IP 地址
  : 'https://your-api-domain.com';  // 生产环境

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
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
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
   * 用户登录
   */
  async login(email, password) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    return response;
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  // ==================== 群组相关 ====================

  /**
   * 创建群组
   */
  async createGroup(groupData) {
    return this.request('/api/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  /**
   * 获取用户的群组列表
   */
  async getUserGroups() {
    return this.request('/api/groups');
  }

  /**
   * 获取群组详情
   */
  async getGroup(groupId) {
    return this.request(`/api/groups/${groupId}`);
  }

  /**
   * 更新群组信息
   */
  async updateGroup(groupId, groupData) {
    return this.request(`/api/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(groupData),
    });
  }

  /**
   * 获取群组成员列表
   */
  async getGroupMembers(groupId) {
    return this.request(`/api/groups/${groupId}/members`);
  }

  // ==================== 任务相关 ====================

  /**
   * 创建任务
   */
  async createTask(taskData) {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  /**
   * 获取群组任务列表
   */
  async getGroupTasks(groupId) {
    return this.request(`/api/tasks/group/${groupId}`);
  }

  /**
   * 获取任务详情
   */
  async getTask(taskId) {
    return this.request(`/api/tasks/${taskId}`);
  }

  /**
   * 更新任务
   */
  async updateTask(taskId, taskData) {
    return this.request(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  /**
   * 标记任务完成
   */
  async completeTask(taskId) {
    return this.request(`/api/tasks/${taskId}/complete`, {
      method: 'POST',
    });
  }

  /**
   * 投票
   */
  async voteTask(taskId, optionId) {
    return this.request(`/api/tasks/${taskId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ option_id: optionId }),
    });
  }

  /**
   * 添加评论
   */
  async addComment(taskId, text, parentId = null) {
    return this.request(`/api/tasks/${taskId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ text, parent_id: parentId }),
    });
  }

  // ==================== 邀请相关 ====================

  /**
   * 创建邀请
   */
  async createInvitation(invitationData) {
    return this.request('/api/invitations', {
      method: 'POST',
      body: JSON.stringify(invitationData),
    });
  }

  /**
   * 获取用户的邀请列表
   */
  async getUserInvitations() {
    return this.request('/api/invitations');
  }

  /**
   * 更新邀请状态（接受或拒绝）
   */
  async updateInvitation(invitationId, status) {
    return this.request(`/api/invitations/${invitationId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
}

// 创建单例实例
const apiClient = new ApiClient();

export default apiClient;


