import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import apiClient from '../../utils/api';
import i18n from '../../utils/i18n';
import TaskList from './TaskList';
import MemberList from './MemberList';

export default function GroupDetailView({ group, user, onBack, onRefresh, refreshKey }) {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'members'
  const [tasks, setTasks] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [groupDetails, setGroupDetails] = useState(group);

  useEffect(() => {
    if (group) {
      setGroupDetails(group);
      loadGroupDetails();
    }
  }, [group, refreshKey]);

  useEffect(() => {
    if (groupDetails && groupDetails.id) {
      loadTasks();
    }
  }, [groupDetails]);

  const loadGroupDetails = async () => {
    if (group && group.id && user && user.id) {
      try {
        // 重新加载群组详情以获取最新的成员列表
        const details = await apiClient.getGroup(group.id, user.id);
        if (details) {
          setGroupDetails(details);
        }
      } catch (error) {
        console.error('Load group details error:', error);
        // 如果API失败，至少使用传入的group数据
        setGroupDetails(group);
      }
    }
  };

  const loadTasks = async () => {
    if (groupDetails && groupDetails.id && user && user.id) {
      try {
        const groupTasks = await apiClient.getGroupTasks(groupDetails.id, user.id);
        setTasks(groupTasks || []);
      } catch (error) {
        console.error('Load tasks error:', error);
        setTasks([]);
      }
    }
  };

  const getUserRole = () => {
    if (!groupDetails || !user) return null;
    const member = groupDetails.members?.find(m => (m.user_id || m.userId) === user.id);
    return member?.role || null;
  };

  const canManage = () => {
    const role = getUserRole();
    return role === 'owner' || role === 'admin';
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert(
        i18n.locale === 'zh' ? '提示' : 'Notice',
        i18n.locale === 'zh' ? '请输入邮箱' : 'Please enter email'
      );
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        i18n.locale === 'zh' ? '邮箱格式不正确' : 'Invalid email format'
      );
      return;
    }

    if (!user || !user.id) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        i18n.locale === 'zh' ? '用户信息不存在' : 'User information not found'
      );
      return;
    }

    try {
      await apiClient.createInvitation({
        group_id: groupDetails.id,
        invitee_email: inviteEmail,
      }, user.id);

      Alert.alert(
        i18n.locale === 'zh' ? '成功' : 'Success',
        i18n.locale === 'zh' ? '邀请已发送' : 'Invitation sent'
      );
      setShowInviteModal(false);
      setInviteEmail('');
      loadGroupDetails();
      onRefresh();
    } catch (error) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        error.message || (i18n.locale === 'zh' ? '发送邀请时发生错误' : 'An error occurred while sending invitation')
      );
    }
  };

  if (!groupDetails) {
    return (
      <View style={styles.container}>
        <Text>{i18n.locale === 'zh' ? '群组不存在' : 'Group not found'}</Text>
      </View>
    );
  }

  const role = getUserRole();
  const isOwner = role === 'owner';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← {i18n.locale === 'zh' ? '返回' : 'Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{groupDetails.name}</Text>
        {canManage() && (
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => setShowInviteModal(true)}
          >
            <Text style={styles.inviteButtonText}>+ {i18n.t('invite')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tasks' && styles.activeTab]}
          onPress={() => setActiveTab('tasks')}
        >
          <Text style={[styles.tabText, activeTab === 'tasks' && styles.activeTabText]}>
            {i18n.t('tasks')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'members' && styles.activeTab]}
          onPress={() => setActiveTab('members')}
        >
          <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
            {i18n.t('members')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'tasks' ? (
          <TaskList
            group={groupDetails}
            tasks={tasks}
            user={user}
            canManage={canManage()}
            onRefresh={loadTasks}
          />
        ) : (
          <MemberList
            group={groupDetails}
            user={user}
            isOwner={isOwner}
            canManage={canManage()}
            onRefresh={() => {
              loadGroupDetails();
              onRefresh();
            }}
          />
        )}
      </ScrollView>

      <Modal
        visible={showInviteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{i18n.t('invite')} {i18n.t('members')}</Text>
            
            <Text style={styles.modalLabel}>{i18n.t('email')}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={i18n.t('email')}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowInviteModal(false)}
              >
                <Text style={styles.cancelButtonText}>{i18n.t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleInvite}
              >
                <Text style={styles.submitButtonText}>{i18n.t('submit')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#667eea',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  inviteButton: {
    backgroundColor: '#667eea',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#667eea',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  modalInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#667eea',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

