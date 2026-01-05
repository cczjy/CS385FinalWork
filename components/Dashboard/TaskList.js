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
import TaskDetailView from './tasks/TaskDetailView';

export default function TaskList({ group, tasks, user, canManage, onRefresh }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskType, setTaskType] = useState('vote');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  // 投票任务选项
  const [voteOptions, setVoteOptions] = useState([
    { id: '1', text: '' },
    { id: '2', text: '' }
  ]);

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert(
        i18n.locale === 'zh' ? '提示' : 'Notice',
        i18n.locale === 'zh' ? '请输入任务标题' : 'Please enter task title'
      );
      return;
    }

    // 如果是投票任务，验证选项
    if (taskType === 'vote') {
      const validOptions = voteOptions.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        Alert.alert(
          i18n.locale === 'zh' ? '提示' : 'Notice',
          i18n.locale === 'zh' ? '投票任务至少需要2个选项' : 'Vote task requires at least 2 options'
        );
        return;
      }
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

      // 如果是投票任务，添加选项
      if (taskType === 'vote') {
        const validOptions = voteOptions
          .filter(opt => opt.text.trim())
          .map((opt, index) => ({
            id: opt.id || (index + 1).toString(),
            text: opt.text.trim()
          }));
        taskData.options = validOptions;
      }

      await apiClient.createTask(taskData, user.id);

      Alert.alert(
        i18n.locale === 'zh' ? '成功' : 'Success',
        i18n.locale === 'zh' ? '任务创建成功' : 'Task created successfully'
      );
      setShowCreateModal(false);
      setTaskTitle('');
      setTaskDescription('');
      // 重置投票选项
      setVoteOptions([
        { id: '1', text: '' },
        { id: '2', text: '' }
      ]);
      onRefresh();
    } catch (error) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        error.message || (i18n.locale === 'zh' ? '创建任务时发生错误' : 'An error occurred while creating task')
      );
    }
  };

  const handleAddVoteOption = () => {
    const newId = (voteOptions.length + 1).toString();
    setVoteOptions([...voteOptions, { id: newId, text: '' }]);
  };

  const handleRemoveVoteOption = (index) => {
    if (voteOptions.length <= 2) {
      Alert.alert(
        i18n.locale === 'zh' ? '提示' : 'Notice',
        i18n.locale === 'zh' ? '投票任务至少需要2个选项' : 'Vote task requires at least 2 options'
      );
      return;
    }
    const newOptions = voteOptions.filter((_, i) => i !== index);
    setVoteOptions(newOptions);
  };

  const handleVoteOptionChange = (index, text) => {
    const newOptions = [...voteOptions];
    newOptions[index].text = text;
    setVoteOptions(newOptions);
  };

  const [selectedTask, setSelectedTask] = useState(null);

  const handleTaskPress = (task) => {
    setSelectedTask(task);
  };

  const renderTask = (task) => {
    const isCompleted = task.completed_by?.includes(user?.id) || false;
    const taskTypeLabel = task.type === 'vote' 
      ? (i18n.locale === 'zh' ? '投票' : 'Vote')
      : (i18n.locale === 'zh' ? '讨论' : 'Discussion');
    
    // 计算评论总数（包括回复）
    const getTotalComments = () => {
      if (task.type !== 'discussion' || !task.comments) return 0;
      let total = task.comments.length;
      task.comments.forEach(comment => {
        if (comment.replies && Array.isArray(comment.replies)) {
          total += comment.replies.length;
        }
      });
      return total;
    };

    const totalComments = getTotalComments();
    
    return (
      <TouchableOpacity
        key={task.id}
        style={styles.taskCard}
        onPress={() => handleTaskPress(task)}
        activeOpacity={0.7}
      >
        <View style={styles.taskCardContent}>
          <View style={styles.taskCardHeader}>
            <View style={styles.taskCardTitleContainer}>
              <Text style={styles.taskCardTitle} numberOfLines={2}>{task.title}</Text>
              <View style={[styles.taskTypeBadge, task.type === 'vote' ? styles.voteBadge : styles.discussionBadge]}>
                <Text style={styles.taskTypeBadgeText}>{taskTypeLabel}</Text>
              </View>
            </View>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>✓</Text>
              </View>
            )}
          </View>
          
          {task.description && (
            <Text style={styles.taskCardDescription} numberOfLines={2}>
              {task.description}
            </Text>
          )}
          
          <View style={styles.taskCardFooter}>
            <View style={styles.taskCardStats}>
              {task.type === 'vote' ? (
                <>
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>📊</Text>
                    <Text style={styles.statText}>
                      {task.options?.length || 0} {i18n.locale === 'zh' ? '选项' : 'options'}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>🗳️</Text>
                    <Text style={styles.statText}>
                      {Object.keys(task.votes || {}).length} {i18n.locale === 'zh' ? '投票' : 'votes'}
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>💬</Text>
                  <Text style={styles.statText}>
                    {totalComments} {i18n.locale === 'zh' ? '评论' : 'comments'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.taskCardArrow}>→</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
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

      {selectedTask ? (
        <TaskDetailView
          task={selectedTask}
          user={user}
          group={group}
          onBack={() => setSelectedTask(null)}
          onRefresh={onRefresh}
          onDelete={async (taskId) => {
            try {
              await apiClient.deleteTask(taskId, user.id);
              Alert.alert(
                i18n.locale === 'zh' ? '成功' : 'Success',
                i18n.locale === 'zh' ? '任务已删除' : 'Task deleted'
              );
              setSelectedTask(null);
              onRefresh();
            } catch (error) {
              throw error;
            }
          }}
        />
      ) : (
        <ScrollView style={styles.tasksList}>
          {tasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {i18n.locale === 'zh' ? '暂无任务' : 'No tasks'}
              </Text>
            </View>
          ) : (
            tasks.map((task) => renderTask(task))
          )}
        </ScrollView>
      )}

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

            {taskType === 'vote' && (
              <>
                <Text style={styles.modalLabel}>
                  {i18n.locale === 'zh' ? '投票选项' : 'Vote Options'} ({voteOptions.length})
                </Text>
                {voteOptions.map((option, index) => (
                  <View key={option.id} style={styles.optionInputRow}>
                    <TextInput
                      style={[styles.modalInput, styles.optionInput]}
                      placeholder={i18n.locale === 'zh' ? `选项 ${index + 1}` : `Option ${index + 1}`}
                      value={option.text}
                      onChangeText={(text) => handleVoteOptionChange(index, text)}
                    />
                    {voteOptions.length > 2 && (
                      <TouchableOpacity
                        style={styles.removeOptionButton}
                        onPress={() => handleRemoveVoteOption(index)}
                      >
                        <Text style={styles.removeOptionButtonText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addOptionButton}
                  onPress={handleAddVoteOption}
                >
                  <Text style={styles.addOptionButtonText}>
                    + {i18n.locale === 'zh' ? '添加选项' : 'Add Option'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

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
  optionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeOptionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  removeOptionButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addOptionButton: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  addOptionButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  taskCardContent: {
    padding: 18,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskCardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 12,
  },
  taskCardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1a1a1a',
    lineHeight: 24,
    marginRight: 10,
  },
  taskTypeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  voteBadge: {
    backgroundColor: '#667eea',
  },
  discussionBadge: {
    backgroundColor: '#ffa726',
  },
  taskTypeBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  taskCardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 14,
    lineHeight: 20,
  },
  taskCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  taskCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  taskCardArrow: {
    fontSize: 18,
    color: '#999',
    fontWeight: '300',
  },
  completedBadge: {
    backgroundColor: '#e8f5e9',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  completedBadgeText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
});

