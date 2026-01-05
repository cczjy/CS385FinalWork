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

export default function DiscussionTask({ task, user, onUpdate, showFullContent = false }) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [comments, setComments] = useState(task.comments || []);

  // 当任务更新时，同步更新评论列表
  React.useEffect(() => {
    if (task && task.comments) {
      setComments(Array.isArray(task.comments) ? task.comments : []);
    }
  }, [task.comments]);

  const isCompleted = task.completed_by?.includes(user?.id) || false;

  const handleComplete = async () => {
    if (!user || !user.id) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        i18n.locale === 'zh' ? '用户信息不存在' : 'User information not found'
      );
      return;
    }

    try {
      await apiClient.completeTask(task.id, user.id);
      Alert.alert(
        i18n.locale === 'zh' ? '成功' : 'Success',
        i18n.locale === 'zh' ? '任务已完成' : 'Task completed'
      );
      onUpdate();
    } catch (error) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        error.message || (i18n.locale === 'zh' ? '完成任务时发生错误' : 'An error occurred while completing task')
      );
    }
  };

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
      const response = await apiClient.addComment(task.id, newComment, user.id);
      setNewComment('');
      // 如果返回了更新后的任务，直接更新本地状态
      if (response && response.task) {
        // 触发父组件更新
        onUpdate();
      } else {
        // 否则重新加载任务
        onUpdate();
      }
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
      const response = await apiClient.addComment(task.id, replyText, user.id, commentId);
      setReplyingTo(null);
      setReplyText('');
      // 如果返回了更新后的任务，直接更新本地状态
      if (response && response.task) {
        // 触发父组件更新
        onUpdate();
      } else {
        // 否则重新加载任务
        onUpdate();
      }
    } catch (error) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        error.message || (i18n.locale === 'zh' ? '添加回复时发生错误' : 'An error occurred while adding reply')
      );
    }
  };

  const getUserName = (comment) => {
    // 优先使用评论中的username字段（后端返回的）
    if (comment && comment.username) {
      return comment.username;
    }
    // 如果没有username，尝试使用email
    if (comment && comment.email) {
      return comment.email;
    }
    // 默认值
    return i18n.locale === 'zh' ? '未知用户' : 'Unknown';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString(i18n.locale === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
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

      <ScrollView style={styles.commentsContainer} showsVerticalScrollIndicator={true}>
        {comments.length === 0 ? (
          <View style={styles.emptyCommentsContainer}>
            <Text style={styles.emptyText}>
              {i18n.locale === 'zh' ? '暂无评论，快来发表第一条评论吧！' : 'No comments yet. Be the first to comment!'}
            </Text>
          </View>
        ) : (
          comments.map((comment, commentIndex) => (
            <View key={comment.id || `comment-${commentIndex}`} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <View style={styles.commentAuthorContainer}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {getUserName(comment).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.commentAuthorInfo}>
                    <Text style={styles.commentAuthor}>{getUserName(comment)}</Text>
                    <Text style={styles.commentDate}>
                      {formatDate(comment.created_at || comment.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.commentText}>{comment.text}</Text>
              
              {comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0 && (
                <View style={styles.repliesContainer}>
                  {comment.replies.map((reply, replyIndex) => (
                    <View key={reply.id || `reply-${replyIndex}`} style={styles.replyItem}>
                      <View style={styles.replyHeader}>
                        <Text style={styles.replyAuthor}>{getUserName(reply)}</Text>
                        <Text style={styles.replyDate}>
                          {formatDate(reply.created_at || reply.createdAt)}
                        </Text>
                      </View>
                      <Text style={styles.replyText}>{reply.text}</Text>
                    </View>
                  ))}
                </View>
              )}

              {!isCompleted && (
                <TouchableOpacity
                  style={styles.replyButton}
                  onPress={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  <Text style={styles.replyButtonText}>
                    {replyingTo === comment.id 
                      ? (i18n.locale === 'zh' ? '取消回复' : 'Cancel') 
                      : `💬 ${i18n.t('reply')}`
                    }
                  </Text>
                </TouchableOpacity>
              )}

              {replyingTo === comment.id && !isCompleted && (
                <View style={styles.replyInputContainer}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder={i18n.locale === 'zh' ? '输入回复...' : 'Enter reply...'}
                    value={replyText}
                    onChangeText={setReplyText}
                    multiline
                    maxLength={500}
                  />
                  <View style={styles.replyInputActions}>
                    <TouchableOpacity
                      style={styles.replyCancelButton}
                      onPress={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                    >
                      <Text style={styles.replyCancelButtonText}>{i18n.t('cancel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.replySubmitButton, !replyText.trim() && styles.replySubmitButtonDisabled]}
                      onPress={() => handleReply(comment.id)}
                      disabled={!replyText.trim()}
                    >
                      <Text style={styles.replySubmitButtonText}>{i18n.t('submit')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder={i18n.t('comment')}
          value={newComment}
          onChangeText={setNewComment}
          multiline
          editable={!isCompleted}
        />
        <TouchableOpacity 
          style={styles.commentSubmitButton} 
          onPress={handleAddComment}
          disabled={isCompleted}
        >
          <Text style={styles.commentSubmitButtonText}>{i18n.t('submit')}</Text>
        </TouchableOpacity>
      </View>

      {!isCompleted && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
        >
          <Text style={styles.completeButtonText}>
            {i18n.locale === 'zh' ? '标记为完成' : 'Mark as Complete'}
          </Text>
        </TouchableOpacity>
      )}

      {isCompleted && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>
            ✓ {i18n.locale === 'zh' ? '已完成' : 'Completed'}
          </Text>
        </View>
      )}
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
    maxHeight: 500,
    marginBottom: 15,
  },
  emptyCommentsContainer: {
    padding: 30,
    alignItems: 'center',
  },
  commentItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#667eea',
  },
  commentHeader: {
    marginBottom: 10,
  },
  commentAuthorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  commentAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentAuthorInfo: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  commentDate: {
    fontSize: 11,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 10,
  },
  repliesContainer: {
    marginTop: 12,
    marginLeft: 10,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#e0e0e0',
  },
  replyItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  replyAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667eea',
  },
  replyDate: {
    fontSize: 10,
    color: '#999',
  },
  replyText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  replyButton: {
    marginTop: 8,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  replyButtonText: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '500',
  },
  replyInputContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  replyInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  replyInputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10,
  },
  replyCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  replyCancelButtonText: {
    color: '#666',
    fontSize: 14,
  },
  replySubmitButton: {
    backgroundColor: '#667eea',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  replySubmitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  replySubmitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
  commentInputContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    fontSize: 14,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  commentSubmitButton: {
    backgroundColor: '#667eea',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    minWidth: 100,
  },
  commentSubmitButtonText: {
    color: '#fff',
    fontSize: 14,
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
});

