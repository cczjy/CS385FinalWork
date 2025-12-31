import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import apiClient from '../../utils/api';
import i18n from '../../utils/i18n';

export default function MemberList({ group, user, isOwner, canManage, onRefresh }) {
  const [members, setMembers] = useState([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    loadMembers();
  }, [group]);

  const loadMembers = async () => {
    if (!group || !group.id) return;
    
    try {
      // 使用API获取成员列表
      const memberList = await apiClient.getGroupMembers(group.id, user?.id);
      setMembers(memberList || []);
    } catch (error) {
      console.error('Load members error:', error);
      // 如果API失败，尝试使用group.members作为后备
      if (group.members) {
        setMembers(group.members);
      }
    }
  };

  const handleRemoveMember = (memberId) => {
    const userId = memberId || (selectedMember?.user_id || selectedMember?.userId);
    if (userId === user.id) {
      Alert.alert(
        i18n.locale === 'zh' ? '提示' : 'Notice',
        i18n.locale === 'zh' ? '不能移除自己' : 'Cannot remove yourself'
      );
      return;
    }

    Alert.alert(
      i18n.locale === 'zh' ? '确认移除' : 'Confirm Remove',
      i18n.locale === 'zh' ? '确定要移除该成员吗？' : 'Are you sure you want to remove this member?',
      [
        {
          text: i18n.t('cancel'),
          style: 'cancel',
        },
        {
          text: i18n.t('remove'),
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: 需要后端API支持删除成员
              // await apiClient.removeGroupMember(group.id, userId, user.id);
              Alert.alert(
                i18n.locale === 'zh' ? '提示' : 'Notice',
                i18n.locale === 'zh' ? '删除成员功能需要后端API支持' : 'Remove member feature requires backend API support'
              );
              // 暂时刷新成员列表
              loadMembers();
              onRefresh();
            } catch (error) {
              Alert.alert(
                i18n.locale === 'zh' ? '错误' : 'Error',
                error.message || (i18n.locale === 'zh' ? '删除成员时发生错误' : 'An error occurred while removing member')
              );
            }
          },
        },
      ]
    );
  };

  const handleChangeRole = async (memberId, newRole) => {
    const userId = memberId || (selectedMember?.user_id || selectedMember?.userId);
    try {
      // TODO: 需要后端API支持更新成员角色
      // await apiClient.updateMemberRole(group.id, userId, newRole, user.id);
      Alert.alert(
        i18n.locale === 'zh' ? '提示' : 'Notice',
        i18n.locale === 'zh' ? '更新角色功能需要后端API支持' : 'Update role feature requires backend API support'
      );
      setShowRoleModal(false);
      setSelectedMember(null);
      loadMembers();
      onRefresh();
    } catch (error) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        error.message || (i18n.locale === 'zh' ? '更新角色时发生错误' : 'An error occurred while updating role')
      );
    }
  };

  const openRoleModal = (member) => {
    setSelectedMember(member);
    setShowRoleModal(true);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'owner':
        return i18n.t('owner');
      case 'admin':
        return i18n.t('admin');
      case 'member':
        return i18n.t('member');
      default:
        return role;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>
          {i18n.t('members')} ({members.length})
        </Text>
      </View>

      <View style={styles.membersList}>
        {members.map((member) => (
          <View key={member.user_id || member.userId || member.id} style={styles.memberCard}>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.username || member.email}</Text>
              <Text style={styles.memberEmail}>{member.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{getRoleLabel(member.role)}</Text>
              </View>
            </View>
            {canManage && (member.user_id || member.userId) !== user.id && (
              <View style={styles.memberActions}>
                {isOwner && member.role !== 'owner' ? (
                  <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => openRoleModal(member)}
                    >
                      <Text style={styles.actionButtonText}>{i18n.t('edit')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.removeButton]}
                      onPress={() => handleRemoveMember(member.user_id || member.userId)}
                    >
                      <Text style={[styles.actionButtonText, styles.removeButtonText]}>
                        {i18n.t('remove')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : !isOwner && member.role === 'member' ? (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => handleRemoveMember(member.user_id || member.userId)}
                  >
                    <Text style={[styles.actionButtonText, styles.removeButtonText]}>
                      {i18n.t('remove')}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
          </View>
        ))}
      </View>

      <Modal
        visible={showRoleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {i18n.locale === 'zh' ? '修改角色' : 'Change Role'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {selectedMember?.username || selectedMember?.email}
            </Text>

            <TouchableOpacity
              style={[styles.roleOption, selectedMember?.role === 'admin' && styles.activeRoleOption]}
              onPress={() => handleChangeRole(selectedMember?.user_id || selectedMember?.userId, 'admin')}
            >
              <Text style={[styles.roleOptionText, selectedMember?.role === 'admin' && styles.activeRoleOptionText]}>
                {i18n.t('admin')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleOption, selectedMember?.role === 'member' && styles.activeRoleOption]}
              onPress={() => handleChangeRole(selectedMember?.user_id || selectedMember?.userId, 'member')}
            >
              <Text style={[styles.roleOptionText, selectedMember?.role === 'member' && styles.activeRoleOptionText]}>
                {i18n.t('member')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowRoleModal(false)}
            >
              <Text style={styles.cancelButtonText}>{i18n.t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 15,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  membersList: {
    padding: 15,
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#667eea',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#ff6b6b',
  },
  removeButtonText: {
    color: '#fff',
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
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  roleOption: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  activeRoleOption: {
    backgroundColor: '#667eea',
  },
  roleOptionText: {
    fontSize: 16,
    color: '#666',
  },
  activeRoleOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
});

