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

export default function HomeView({ user, groups, onGroupSelect, onRefresh, refreshKey }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  useEffect(() => {
    // 当 refreshKey 变化时，可以触发重新加载
  }, [refreshKey]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert(
        i18n.locale === 'zh' ? '提示' : 'Notice',
        i18n.locale === 'zh' ? '请输入群组名称' : 'Please enter group name'
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
      const newGroup = await apiClient.createGroup({
        name: groupName,
        description: groupDescription,
      }, user.id);

      if (newGroup) {
        Alert.alert(
          i18n.locale === 'zh' ? '成功' : 'Success',
          i18n.locale === 'zh' ? '群组创建成功' : 'Group created successfully'
        );
        setShowCreateModal(false);
        setGroupName('');
        setGroupDescription('');
        onRefresh();
      }
    } catch (error) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        error.message || (i18n.locale === 'zh' ? '创建群组时发生错误' : 'An error occurred while creating group')
      );
    }
  };

  const canCreateGroup = () => {
    // 检查用户是否有创建群组的权限（群主或管理员）
    return true; // 简化处理，所有用户都可以创建
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t('dashboard')}</Text>
        {canCreateGroup() && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.createButtonText}>+ {i18n.t('createGroup')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>{i18n.t('groups')}</Text>
        {groups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {i18n.locale === 'zh' ? '还没有群组，创建一个吧！' : 'No groups yet, create one!'}
            </Text>
          </View>
        ) : (
          groups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.groupCard}
              onPress={() => onGroupSelect(group)}
            >
              <Text style={styles.groupCardTitle}>{group.name}</Text>
              <Text style={styles.groupCardDescription} numberOfLines={2}>
                {group.description || i18n.locale === 'zh' ? '无描述' : 'No description'}
              </Text>
              <View style={styles.groupCardFooter}>
                <Text style={styles.groupCardMembers}>
                  {group.members?.length || 0} {i18n.t('members')}
                </Text>
                <Text style={styles.groupCardDate}>
                  {new Date(group.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{i18n.t('createGroup')}</Text>
            
            <Text style={styles.modalLabel}>{i18n.t('groupName')}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={i18n.t('groupName')}
              value={groupName}
              onChangeText={setGroupName}
            />

            <Text style={styles.modalLabel}>{i18n.t('description')}</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder={i18n.t('description')}
              value={groupDescription}
              onChangeText={setGroupDescription}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>{i18n.t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleCreateGroup}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#667eea',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  groupCardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  groupCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupCardMembers: {
    fontSize: 12,
    color: '#667eea',
  },
  groupCardDate: {
    fontSize: 12,
    color: '#999',
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
  modalTextArea: {
    height: 100,
    textAlignVertical: 'top',
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

