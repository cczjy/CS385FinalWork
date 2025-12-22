import AsyncStorage from '@react-native-async-storage/async-storage';

// 存储键名
const STORAGE_KEYS = {
  USER_DATA: 'userData',
  USERS: 'users',
  GROUPS: 'groups',
  TASKS: 'tasks',
  INVITATIONS: 'invitations',
};

// 用户数据管理
export const UserStorage = {
  // 保存用户数据
  saveUser: async (userData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Save user error:', error);
      return false;
    }
  },

  // 获取当前用户
  getCurrentUser: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  // 清除用户数据
  clearUser: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      return true;
    } catch (error) {
      console.error('Clear user error:', error);
      return false;
    }
  },

  // 注册新用户
  registerUser: async (userData) => {
    try {
      const users = await UserStorage.getAllUsers();
      const newUser = {
        id: Date.now().toString(),
        username: userData.username,
        email: userData.email,
        password: userData.password, // 实际应用中应该加密
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return newUser;
    } catch (error) {
      console.error('Register user error:', error);
      return null;
    }
  },

  // 获取所有用户
  getAllUsers: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Get users error:', error);
      return [];
    }
  },

  // 验证登录
  validateLogin: async (email, password) => {
    try {
      const users = await UserStorage.getAllUsers();
      const user = users.find(u => u.email === email && u.password === password);
      return user || null;
    } catch (error) {
      console.error('Validate login error:', error);
      return null;
    }
  },

  // 更新用户信息
  updateUser: async (userId, updates) => {
    try {
      const users = await UserStorage.getAllUsers();
      const index = users.findIndex(u => u.id === userId);
      if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        // 更新当前用户数据
        const currentUser = await UserStorage.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
          await UserStorage.saveUser(users[index]);
        }
        return users[index];
      }
      return null;
    } catch (error) {
      console.error('Update user error:', error);
      return null;
    }
  },
};

// 群组数据管理
export const GroupStorage = {
  // 获取所有群组
  getAllGroups: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.GROUPS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Get groups error:', error);
      return [];
    }
  },

  // 创建群组
  createGroup: async (groupData) => {
    try {
      const groups = await GroupStorage.getAllGroups();
      const newGroup = {
        id: Date.now().toString(),
        name: groupData.name,
        description: groupData.description || '',
        ownerId: groupData.ownerId,
        members: [
          {
            userId: groupData.ownerId,
            role: 'owner',
            joinedAt: new Date().toISOString(),
          }
        ],
        createdAt: new Date().toISOString(),
      };
      groups.push(newGroup);
      await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
      return newGroup;
    } catch (error) {
      console.error('Create group error:', error);
      return null;
    }
  },

  // 更新群组
  updateGroup: async (groupId, updates) => {
    try {
      const groups = await GroupStorage.getAllGroups();
      const index = groups.findIndex(g => g.id === groupId);
      if (index !== -1) {
        groups[index] = { ...groups[index], ...updates };
        await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
        return groups[index];
      }
      return null;
    } catch (error) {
      console.error('Update group error:', error);
      return null;
    }
  },

  // 获取用户加入的群组
  getUserGroups: async (userId) => {
    try {
      const groups = await GroupStorage.getAllGroups();
      return groups.filter(g => 
        g.members.some(m => m.userId === userId)
      );
    } catch (error) {
      console.error('Get user groups error:', error);
      return [];
    }
  },

  // 添加成员到群组
  addMember: async (groupId, memberData) => {
    try {
      const groups = await GroupStorage.getAllGroups();
      const group = groups.find(g => g.id === groupId);
      if (group) {
        const member = {
          userId: memberData.userId,
          role: memberData.role || 'member',
          joinedAt: new Date().toISOString(),
        };
        group.members.push(member);
        await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
        return group;
      }
      return null;
    } catch (error) {
      console.error('Add member error:', error);
      return null;
    }
  },

  // 移除成员
  removeMember: async (groupId, userId) => {
    try {
      const groups = await GroupStorage.getAllGroups();
      const group = groups.find(g => g.id === groupId);
      if (group) {
        group.members = group.members.filter(m => m.userId !== userId);
        await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
        return group;
      }
      return null;
    } catch (error) {
      console.error('Remove member error:', error);
      return null;
    }
  },

  // 更新成员角色
  updateMemberRole: async (groupId, userId, newRole) => {
    try {
      const groups = await GroupStorage.getAllGroups();
      const group = groups.find(g => g.id === groupId);
      if (group) {
        const member = group.members.find(m => m.userId === userId);
        if (member) {
          member.role = newRole;
          await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
          return group;
        }
      }
      return null;
    } catch (error) {
      console.error('Update member role error:', error);
      return null;
    }
  },
};

// 任务数据管理
export const TaskStorage = {
  // 获取所有任务
  getAllTasks: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Get tasks error:', error);
      return [];
    }
  },

  // 创建任务
  createTask: async (taskData) => {
    try {
      const tasks = await TaskStorage.getAllTasks();
      const newTask = {
        id: Date.now().toString(),
        groupId: taskData.groupId,
        type: taskData.type, // 'document', 'vote', 'discussion'
        title: taskData.title,
        description: taskData.description || '',
        createdBy: taskData.createdBy,
        createdAt: new Date().toISOString(),
        // 文档任务
        documentUrl: taskData.documentUrl || null,
        documentName: taskData.documentName || null,
        // 投票任务
        options: taskData.options || [],
        votes: taskData.votes || {},
        // 讨论任务
        comments: taskData.comments || [],
        // 通用
        completedBy: taskData.completedBy || [],
      };
      tasks.push(newTask);
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return newTask;
    } catch (error) {
      console.error('Create task error:', error);
      return null;
    }
  },

  // 更新任务
  updateTask: async (taskId, updates) => {
    try {
      const tasks = await TaskStorage.getAllTasks();
      const index = tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updates };
        await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        return tasks[index];
      }
      return null;
    } catch (error) {
      console.error('Update task error:', error);
      return null;
    }
  },

  // 获取群组任务
  getGroupTasks: async (groupId) => {
    try {
      const tasks = await TaskStorage.getAllTasks();
      return tasks.filter(t => t.groupId === groupId);
    } catch (error) {
      console.error('Get group tasks error:', error);
      return [];
    }
  },
};

// 邀请数据管理
export const InvitationStorage = {
  // 获取所有邀请
  getAllInvitations: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.INVITATIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Get invitations error:', error);
      return [];
    }
  },

  // 创建邀请
  createInvitation: async (invitationData) => {
    try {
      const invitations = await InvitationStorage.getAllInvitations();
      const newInvitation = {
        id: Date.now().toString(),
        groupId: invitationData.groupId,
        groupName: invitationData.groupName,
        inviterId: invitationData.inviterId,
        inviteeEmail: invitationData.inviteeEmail,
        status: 'pending', // 'pending', 'accepted', 'rejected'
        createdAt: new Date().toISOString(),
      };
      invitations.push(newInvitation);
      await AsyncStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invitations));
      return newInvitation;
    } catch (error) {
      console.error('Create invitation error:', error);
      return null;
    }
  },

  // 更新邀请状态
  updateInvitationStatus: async (invitationId, status) => {
    try {
      const invitations = await InvitationStorage.getAllInvitations();
      const index = invitations.findIndex(i => i.id === invitationId);
      if (index !== -1) {
        invitations[index].status = status;
        await AsyncStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invitations));
        return invitations[index];
      }
      return null;
    } catch (error) {
      console.error('Update invitation error:', error);
      return null;
    }
  },

  // 获取用户的邀请
  getUserInvitations: async (userEmail) => {
    try {
      const invitations = await InvitationStorage.getAllInvitations();
      return invitations.filter(i => i.inviteeEmail === userEmail);
    } catch (error) {
      console.error('Get user invitations error:', error);
      return [];
    }
  },
};

// 清除所有数据（应用关闭时）
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.USERS,
      STORAGE_KEYS.GROUPS,
      STORAGE_KEYS.TASKS,
      STORAGE_KEYS.INVITATIONS,
    ]);
    return true;
  } catch (error) {
    console.error('Clear all data error:', error);
    return false;
  }
};

