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
import apiClient from '../../../utils/api';
import i18n from '../../../utils/i18n';
import VoteTask from './VoteTask';
import DiscussionTask from './DiscussionTask';

export default function TaskDetailView({ task, user, group, onBack, onRefresh, onDelete }) {
  const [taskDetails, setTaskDetails] = useState(task);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTaskDetails();
  }, [task.id]);

  const loadTaskDetails = async () => {
    if (!task.id || !user?.id) return;
    
    setLoading(true);
    try {
      const details = await apiClient.getTask(task.id, user.id);
      if (details) {
        setTaskDetails(details);
      }
    } catch (error) {
      console.error('Load task details error:', error);
    } finally {
      setLoading(false);
    }
  };

  const canDelete = () => {
    if (!user || !group || !taskDetails) return false;
    const role = group.members?.find(m => (m.user_id || m.userId) === user.id)?.role;
    const isOwner = role === 'owner';
    const isCreator = taskDetails.created_by === user.id;
    return isOwner || isCreator;
  };

  const handleDelete = () => {
    Alert.alert(
      i18n.locale === 'zh' ? '确认删除' : 'Confirm Delete',
      i18n.locale === 'zh' ? '确定要删除这个任务吗？' : 'Are you sure you want to delete this task?',
      [
        {
          text: i18n.locale === 'zh' ? '取消' : 'Cancel',
          style: 'cancel',
        },
        {
          text: i18n.locale === 'zh' ? '删除' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDelete(taskDetails.id);
              onBack();
            } catch (error) {
              Alert.alert(
                i18n.locale === 'zh' ? '错误' : 'Error',
                error.message || (i18n.locale === 'zh' ? '删除任务失败' : 'Failed to delete task')
              );
            }
          },
        },
      ]
    );
  };

  const renderTaskContent = () => {
    if (!taskDetails) return null;

    switch (taskDetails.type) {
      case 'vote':
        return (
          <VoteTask 
            task={taskDetails} 
            user={user} 
            onUpdate={loadTaskDetails}
            showFullContent={true}
          />
        );
      case 'discussion':
        return (
          <DiscussionTask 
            task={taskDetails} 
            user={user} 
            onUpdate={loadTaskDetails}
            showFullContent={true}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← {i18n.locale === 'zh' ? '返回' : 'Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {i18n.locale === 'zh' ? '任务详情' : 'Task Details'}
        </Text>
        {canDelete() && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>
              {i18n.locale === 'zh' ? '删除' : 'Delete'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>
            {i18n.locale === 'zh' ? '加载中...' : 'Loading...'}
          </Text>
        ) : (
          renderTaskContent()
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  deleteButton: {
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 14,
  },
});

