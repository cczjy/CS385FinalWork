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

export default function VoteTask({ task, user, onUpdate }) {
  const [showAddOptionModal, setShowAddOptionModal] = useState(false);
  const [newOption, setNewOption] = useState('');

  const options = task.options || [];
  const votes = task.votes || {};
  const userVote = votes[user.id];

  const handleVote = async (optionIndex) => {
    try {
      const updatedVotes = { ...votes, [user.id]: optionIndex };
      await TaskStorage.updateTask(task.id, { votes: updatedVotes });
      Alert.alert(
        i18n.locale === 'zh' ? '成功' : 'Success',
        i18n.locale === 'zh' ? '投票成功' : 'Vote submitted successfully'
      );
      onUpdate();
    } catch (error) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        i18n.locale === 'zh' ? '投票时发生错误' : 'An error occurred while voting'
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
    const option = normalizedOptions[optionIndex];
    const optionId = option?.id || optionIndex.toString();
    return Object.values(votes).filter(v => v === optionId).length;
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
          const voteCount = getVoteCount(index);
          const percentage = getTotalVotes() > 0 ? (voteCount / getTotalVotes()) * 100 : 0;
          const isSelected = userVote === index;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.optionItem, isSelected && styles.selectedOption]}
              onPress={() => !userVote && handleVote(index)}
              disabled={!!userVote}
            >
              <View style={styles.optionHeader}>
                <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                  {option}
                </Text>
                {isSelected && (
                  <Text style={styles.selectedBadge}>✓</Text>
                )}
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${percentage}%` }]} />
              </View>
              <Text style={styles.voteCount}>
                {voteCount} {i18n.locale === 'zh' ? '票' : 'votes'} ({percentage.toFixed(1)}%)
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {options.length === 0 && (
        <Text style={styles.emptyText}>
          {i18n.locale === 'zh' ? '暂无选项' : 'No options yet'}
        </Text>
      )}

      <TouchableOpacity
        style={styles.addOptionButton}
        onPress={() => setShowAddOptionModal(true)}
      >
        <Text style={styles.addOptionButtonText}>+ {i18n.locale === 'zh' ? '添加选项' : 'Add Option'}</Text>
      </TouchableOpacity>

      <View style={styles.taskFooter}>
        <Text style={styles.totalVotesText}>
          {i18n.locale === 'zh' ? '总票数' : 'Total Votes'}: {getTotalVotes()}
        </Text>
        {userVote !== undefined && (
          <Text style={styles.votedText}>
            {i18n.locale === 'zh' ? '已投票' : 'Voted'}
          </Text>
        )}
      </View>

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

