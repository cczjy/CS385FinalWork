import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import apiClient from '../../../utils/api';
import i18n from '../../../utils/i18n';

export default function VoteTask({ task, user, group, onUpdate, showFullContent = false }) {
  const [showAddOptionModal, setShowAddOptionModal] = useState(false);
  const [newOption, setNewOption] = useState('');

  const options = task.options || [];
  const votes = task.votes || {};
  
  // 尝试多种方式匹配用户ID，确保能正确获取投票状态
  const userIdStr = String(user?.id);
  const userIdNum = Number(user?.id);
  const userVote = votes[userIdStr] || votes[userIdNum] || votes[user?.id] || null;
  
  const isCompleted = task.completed_by?.includes(user?.id) || false;

  // 检查用户是否是群主
  const isOwner = () => {
    if (!user || !group) return false;
    const role = group.members?.find(m => (m.user_id || m.userId) === user.id)?.role;
    return role === 'owner';
  };


  const handleVote = async (optionIndex) => {
    if (!user || !user.id) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        i18n.locale === 'zh' ? '用户信息不存在' : 'User information not found'
      );
      return;
    }

    // 重新获取最新的投票数据，避免使用旧的 userVote 值
    const currentVotes = task.votes || {};
    const currentUserVote = currentVotes[String(user.id)] || currentVotes[user.id];
    
    // 如果用户已经投票，阻止再次投票
    if (currentUserVote !== undefined && currentUserVote !== null) {
      Alert.alert(
        i18n.locale === 'zh' ? '提示' : 'Notice',
        i18n.locale === 'zh' ? '您已经投过票了' : 'You have already voted'
      );
      return;
    }

    // 如果任务已完成，不允许投票
    if (isCompleted) {
      Alert.alert(
        i18n.locale === 'zh' ? '提示' : 'Notice',
        i18n.locale === 'zh' ? '任务已完成，无法投票' : 'Task is completed, cannot vote'
      );
      return;
    }

    try {
      const option = options[optionIndex];
      if (!option) {
        Alert.alert(
          i18n.locale === 'zh' ? '错误' : 'Error',
          i18n.locale === 'zh' ? '选项不存在' : 'Option not found'
        );
        return;
      }
      const optionId = option?.id || optionIndex.toString();
      
      // 调用投票API
      await apiClient.voteTask(task.id, optionId, user.id);
      
      // 投票成功后，立即刷新数据以显示最新的投票率
      if (onUpdate) {
        await onUpdate();
      }
    } catch (error) {
      console.error('投票错误:', error);
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        error.message || (i18n.locale === 'zh' ? '投票时发生错误' : 'An error occurred while voting')
      );
    }
  };

  const handleAddOption = async () => {
    if (!newOption.trim()) {
      Alert.alert(
        i18n.locale === 'zh' ? '提示' : 'Notice',
        i18n.locale === 'zh' ? '请输入选项' : 'Please enter an option'
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
      const updatedOptions = [...options, { id: Date.now().toString(), text: newOption }];
      await apiClient.updateTask(task.id, { options: updatedOptions }, user.id);
      setShowAddOptionModal(false);
      setNewOption('');
      onUpdate();
    } catch (error) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        error.message || (i18n.locale === 'zh' ? '添加选项时发生错误' : 'An error occurred while adding option')
      );
    }
  };

  const getVoteCount = (optionIndex) => {
    const option = options[optionIndex];
    const optionId = option?.id || optionIndex.toString();
    // 只使用 optionId 匹配，确保统计准确
    return Object.values(votes).filter(v => String(v) === String(optionId)).length;
  };

  const getTotalVotes = () => {
    return Object.keys(votes).length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <View style={styles.taskTypeBadge}>
          <Text style={styles.taskTypeText}>{i18n.t('voteTask')}</Text>
        </View>
      </View>

      {task.description && (
        <Text style={styles.taskDescription}>{task.description}</Text>
      )}

      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const optionId = option?.id || index.toString();
          const voteCount = getVoteCount(index);
          const percentage = getTotalVotes() > 0 ? (voteCount / getTotalVotes()) * 100 : 0;
          // 只使用 optionId 匹配，确保只选中一个选项
          const isSelected = userVote && String(userVote) === String(optionId);
          // 只有当前用户没有投票且任务未完成时才能投票
          const canVote = !userVote && !isCompleted;
          const isOwnerUser = isOwner();

          const optionText = typeof option === 'string' ? option : (option?.text || String(option));
          return (
            <TouchableOpacity
              key={`option-${optionId}-${index}`}
              style={[styles.optionItem, isSelected && styles.selectedOption]}
              onPress={() => canVote && handleVote(index)}
              disabled={!canVote}
            >
              <View style={styles.optionHeader}>
                <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                  {optionText}
                </Text>
                {isSelected && (
                  <Text style={styles.selectedBadge}>✓</Text>
                )}
              </View>
              {/* 群主始终可以看到投票率和进度条 */}
              {/* 群员：投之前隐藏票数，投之后可以查看 */}
              {(isOwnerUser || userVote) && (
                <>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${percentage}%` }]} />
                  </View>
                  <Text style={styles.voteCount}>
                    {voteCount} {i18n.locale === 'zh' ? '票' : 'votes'} ({percentage.toFixed(1)}%)
                  </Text>
                </>
              )}
              {/* 群员未投票时不显示任何信息 */}
            </TouchableOpacity>
          );
        })}
      </View>

      {options.length === 0 && (
        <Text style={styles.emptyText}>
          {i18n.locale === 'zh' ? '暂无选项' : 'No options yet'}
        </Text>
      )}

      {showFullContent && !isCompleted && (
        <TouchableOpacity
          style={styles.addOptionButton}
          onPress={() => setShowAddOptionModal(true)}
        >
          <Text style={styles.addOptionButtonText}>+ {i18n.locale === 'zh' ? '添加选项' : 'Add Option'}</Text>
        </TouchableOpacity>
      )}

      {/* 群主始终可以看到总票数，群员投之后也可以看到 */}
      {(isOwner() || userVote) && (
        <View style={styles.taskFooter}>
          <Text style={styles.totalVotesText}>
            {i18n.locale === 'zh' ? '总票数' : 'Total Votes'}: {getTotalVotes()}
          </Text>
          {userVote !== undefined && userVote !== null && (
            <Text style={styles.votedText}>
              {i18n.locale === 'zh' ? '已投票' : 'Voted'}
            </Text>
          )}
        </View>
      )}


      <Modal
        visible={showAddOptionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddOptionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{i18n.locale === 'zh' ? '添加选项' : 'Add Option'}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={i18n.locale === 'zh' ? '输入选项' : 'Enter option'}
              value={newOption}
              onChangeText={setNewOption}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddOptionModal(false)}
              >
                <Text style={styles.cancelButtonText}>{i18n.t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddOption}
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  taskTypeBadge: {
    backgroundColor: '#51cf66',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  taskTypeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  optionsContainer: {
    marginBottom: 15,
  },
  optionItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    fontWeight: 'bold',
    color: '#667eea',
  },
  selectedBadge: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  voteCount: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 15,
  },
  addOptionButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  addOptionButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalVotesText: {
    fontSize: 12,
    color: '#666',
  },
  votedText: {
    fontSize: 12,
    color: '#51cf66',
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: '#51cf66',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  completedBadge: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  completedText: {
    color: '#51cf66',
    fontSize: 14,
    fontWeight: 'bold',
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

