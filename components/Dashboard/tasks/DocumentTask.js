import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import apiClient from '../../../utils/api';
import i18n from '../../../utils/i18n';

export default function DocumentTask({ task, user, onUpdate }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documentName, setDocumentName] = useState(task.documentName || '');

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      if (result.assets && result.assets.length > 0) {
        if (!user || !user.id) {
          Alert.alert(
            i18n.locale === 'zh' ? '错误' : 'Error',
            i18n.locale === 'zh' ? '用户信息不存在' : 'User information not found'
          );
          return;
        }

        const file = result.assets[0];
        // 注意：这里只是保存本地 URI，实际文件上传需要额外的上传端点
        await apiClient.updateTask(task.id, {
          document_name: file.name || 'document',
          document_url: file.uri,
        }, user.id);
        Alert.alert(
          i18n.locale === 'zh' ? '成功' : 'Success',
          i18n.locale === 'zh' ? '文档上传成功' : 'Document uploaded successfully'
        );
        setShowUploadModal(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        i18n.locale === 'zh' ? '上传文档时发生错误' : 'An error occurred while uploading document'
      );
    }
  };

  const handleDownload = () => {
    if (task.documentUrl) {
      Alert.alert(
        i18n.locale === 'zh' ? '下载' : 'Download',
        i18n.locale === 'zh' ? '文档已准备下载' : 'Document ready for download'
      );
      // 实际应用中应该实现文件下载逻辑
    }
  };

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

  const isCompleted = task.completedBy?.includes(user.id) || false;

  return (
    <View style={styles.container}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <View style={styles.taskTypeBadge}>
          <Text style={styles.taskTypeText}>{i18n.t('documentTask')}</Text>
        </View>
      </View>

      {task.description && (
        <Text style={styles.taskDescription}>{task.description}</Text>
      )}

      {task.documentName ? (
        <View style={styles.documentInfo}>
          <Text style={styles.documentName}>{task.documentName}</Text>
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
            <Text style={styles.downloadButtonText}>{i18n.t('download')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setShowUploadModal(true)}
        >
          <Text style={styles.uploadButtonText}>{i18n.t('upload')} {i18n.t('documentTask')}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.taskFooter}>
        <Text style={styles.completionText}>
          {i18n.locale === 'zh' ? '已完成' : 'Completed'}: {task.completedBy?.length || 0}
        </Text>
        {!isCompleted && (
          <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
            <Text style={styles.completeButtonText}>{i18n.locale === 'zh' ? '标记完成' : 'Mark Complete'}</Text>
          </TouchableOpacity>
        )}
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓ {i18n.locale === 'zh' ? '已完成' : 'Completed'}</Text>
          </View>
        )}
      </View>

      <Modal
        visible={showUploadModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{i18n.t('upload')} {i18n.t('documentTask')}</Text>
            <TouchableOpacity style={styles.uploadModalButton} onPress={handleUpload}>
              <Text style={styles.uploadModalButtonText}>{i18n.t('upload')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowUploadModal(false)}
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
    backgroundColor: '#667eea',
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
  documentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  documentName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  downloadButton: {
    backgroundColor: '#667eea',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completionText: {
    fontSize: 12,
    color: '#666',
  },
  completeButton: {
    backgroundColor: '#667eea',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  completedBadge: {
    backgroundColor: '#51cf66',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  completedText: {
    color: '#fff',
    fontSize: 12,
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
  uploadModalButton: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
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

