import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import apiClient from '../../utils/api';
import i18n from '../../utils/i18n';
import DocumentTask from './tasks/DocumentTask';
import VoteTask from './tasks/VoteTask';
import DiscussionTask from './tasks/DiscussionTask';

export default function TaskList({ group, tasks, user, canManage, onRefresh }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskType, setTaskType] = useState('document');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert(
        i18n.locale === 'zh' ? '提示' : 'Notice',
        i18n.locale === 'zh' ? '请输入任务标题' : 'Please enter task title'
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
      const taskData = {
        group_id: group.id,
        type: taskType,
        title: taskTitle,
        description: taskDescription,
      };

      await apiClient.createTask(taskData, user.id);
      Alert.alert(
        i18n.locale === 'zh' ? '成功' : 'Success',
        i18n.locale === 'zh' ? '任务创建成功' : 'Task created successfully'
      );
      setShowCreateModal(false);
      setTaskTitle('');
      setTaskDescription('');
      onRefresh();
    } catch (error) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        error.message || (i18n.locale === 'zh' ? '创建任务时发生错误' : 'An error occurred while creating task')
      );
    }
  };

  const renderTask = (task) => {
    switch (task.type) {
      case 'document':
        return <DocumentTask key={task.id} task={task} user={user} onUpdate={onRefresh} />;
      case 'vote':
        return <VoteTask key={task.id} task={task} user={user} onUpdate={onRefresh} />;
      case 'discussion':
        return <DiscussionTask key={task.id} task={task} user={user} onUpdate={onRefresh} />;
      default:
        return null;
    }
  };

  const getCompletionRate = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => 
      t.completedBy && t.completedBy.length > 0
    ).length;
    return Math.round((completed / tasks.length) * 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionTitle}>{i18n.t('tasks')}</Text>
          <Text style={styles.completionText}>
            {i18n.t('completion')}: {getCompletionRate()}%
          </Text>
        </View>
        {canManage && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.createButtonText}>+ {i18n.t('createTask')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.tasksList}>
        {tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {i18n.locale === 'zh' ? '暂无任务' : 'No tasks'}
            </Text>
          </View>
        ) : (
          tasks.map(renderTask)
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
            <Text style={styles.modalTitle}>{i18n.t('createTask')}</Text>

            <Text style={styles.modalLabel}>{i18n.locale === 'zh' ? '任务类型' : 'Task Type'}</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[styles.typeButton, taskType === 'document' && styles.activeTypeButton]}
                onPress={() => setTaskType('document')}
              >
                <Text style={[styles.typeButtonText, taskType === 'document' && styles.activeTypeButtonText]}>
                  {i18n.t('documentTask')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, taskType === 'vote' && styles.activeTypeButton]}
                onPress={() => setTaskType('vote')}
              >
                <Text style={[styles.typeButtonText, taskType === 'vote' && styles.activeTypeButtonText]}>
                  {i18n.t('voteTask')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, taskType === 'discussion' && styles.activeTypeButton]}
                onPress={() => setTaskType('discussion')}
              >
                <Text style={[styles.typeButtonText, taskType === 'discussion' && styles.activeTypeButtonText]}>
                  {i18n.t('discussionTask')}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>{i18n.t('title')}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={i18n.t('title')}
              value={taskTitle}
              onChangeText={setTaskTitle}
            />

            <Text style={styles.modalLabel}>{i18n.t('description')}</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder={i18n.t('description')}
              value={taskDescription}
              onChangeText={setTaskDescription}
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
                onPress={handleCreateTask}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  completionText: {
    fontSize: 14,
    color: '#667eea',
    marginTop: 5,
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
  tasksList: {
    flex: 1,
    padding: 15,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
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
  typeButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  activeTypeButton: {
    backgroundColor: '#667eea',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#666',
  },
  activeTypeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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

