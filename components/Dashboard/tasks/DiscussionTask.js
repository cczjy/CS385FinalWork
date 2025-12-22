import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import apiClient from '../../../utils/api';
import i18n from '../../../utils/i18n';

export default function DiscussionTask({ task, user, onUpdate }) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [users, setUsers] = useState({});

  React.useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    // 用户信息现在从任务评论中获取，不需要单独加载
    // 如果需要，可以从 API 获取用户信息
  };

  const comments = task.comments || [];

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert(
        i18n.locale === 'zh' ? '提示' : 'Notice',
        i18n.locale === 'zh' ? '请输入评论' : 'Please enter a comment'
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
      await apiClient.addComment(task.id, newComment, user.id);
      setNewComment('');
      onUpdate();
    } catch (error) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        error.message || (i18n.locale === 'zh' ? '添加评论时发生错误' : 'An error occurred while adding comment')
      );
    }
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim()) {
      Alert.alert(
        i18n.locale === 'zh' ? '提示' : 'Notice',
        i18n.locale === 'zh' ? '请输入回复' : 'Please enter a reply'
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
      await apiClient.addComment(task.id, replyText, user.id, commentId);
      setReplyingTo(null);
      setReplyText('');
      onUpdate();
    } catch (error) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        error.message || (i18n.locale === 'zh' ? '添加回复时发生错误' : 'An error occurred while adding reply')
      );
    }
  };

  const getUserName = (userId) => {
    return users[userId]?.username || users[userId]?.email || i18n.locale === 'zh' ? '未知用户' : 'Unknown';
  };

  return (
    <View style={styles.container}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <View style={styles.taskTypeBadge}>
          <Text style={styles.taskTypeText}>{i18n.t('discussionTask')}</Text>
        </View>
      </View>

      {task.description && (
        <Text style={styles.taskDescription}>{task.description}</Text>
      )}

      <ScrollView style={styles.commentsContainer}>
        {comments.map((comment) => (
          <View key={comment.id} style={styles.commentItem}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentAuthor}>{getUserName(comment.userId)}</Text>
              <Text style={styles.commentDate}>
                {new Date(comment.createdAt).toLocaleString()}
              </Text>
            </View>
            <Text style={styles.commentText}>{comment.text}</Text>
            
            {comment.replies && comment.replies.length > 0 && (
              <View style={styles.repliesContainer}>
                {comment.replies.map((reply) => (
                  <View key={reply.id} style={styles.replyItem}>
                    <Text style={styles.replyAuthor}>{getUserName(reply.userId)}:</Text>
                    <Text style={styles.replyText}>{reply.text}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.replyButton}
              onPress={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            >
              <Text style={styles.replyButtonText}>
                {replyingTo === comment.id ? i18n.locale === 'zh' ? '取消回复' : 'Cancel' : i18n.t('reply')}
              </Text>
            </TouchableOpacity>

            {replyingTo === comment.id && (
              <View style={styles.replyInputContainer}>
                <TextInput
                  style={styles.replyInput}
                  placeholder={i18n.t('reply')}
                  value={replyText}
                  onChangeText={setReplyText}
                  multiline
                />
                <TouchableOpacity
                  style={styles.replySubmitButton}
                  onPress={() => handleReply(comment.id)}
                >
                  <Text style={styles.replySubmitButtonText}>{i18n.t('submit')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
        {comments.length === 0 && (
          <Text style={styles.emptyText}>
            {i18n.locale === 'zh' ? '暂无评论' : 'No comments yet'}
          </Text>
        )}
      </ScrollView>

      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder={i18n.t('comment')}
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity style={styles.commentSubmitButton} onPress={handleAddComment}>
          <Text style={styles.commentSubmitButtonText}>{i18n.t('submit')}</Text>
        </TouchableOpacity>
      </View>
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
    maxHeight: 600,
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
    backgroundColor: '#ffa726',
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
  commentsContainer: {
    maxHeight: 400,
    marginBottom: 15,
  },
  commentItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  repliesContainer: {
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  replyItem: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    marginBottom: 5,
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#667eea',
  },
  replyText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  replyButton: {
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  replyButtonText: {
    fontSize: 12,
    color: '#667eea',
  },
  replyInputContainer: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
  },
  replySubmitButton: {
    backgroundColor: '#667eea',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: 'center',
  },
  replySubmitButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  commentSubmitButton: {
    backgroundColor: '#667eea',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: 'center',
  },
  commentSubmitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

