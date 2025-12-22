import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import apiClient from '../../utils/api';
import i18n from '../../utils/i18n';

export default function MessagesView({ user, onRefresh, refreshKey }) {
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    loadInvitations();
  }, [user, refreshKey]);

  const loadInvitations = async () => {
    if (!user || !user.email) {
      return;
    }
    try {
      const userInvitations = await apiClient.getUserInvitations(user.email);
      setInvitations(userInvitations);
    } catch (error) {
      console.error('Load invitations error:', error);
    }
  };

  const handleAccept = async (invitation) => {
    if (!user || !user.email) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        i18n.locale === 'zh' ? '用户信息不存在' : 'User information not found'
      );
      return;
    }

    try {
      await apiClient.updateInvitation(invitation.id, 'accepted', user.email);
      
      Alert.alert(
        i18n.locale === 'zh' ? '成功' : 'Success',
        i18n.locale === 'zh' ? '已接受邀请' : 'Invitation accepted'
      );
      loadInvitations();
      onRefresh();
    } catch (error) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        error.message || (i18n.locale === 'zh' ? '接受邀请时发生错误' : 'An error occurred while accepting invitation')
      );
    }
  };

  const handleReject = async (invitation) => {
    if (!user || !user.email) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        i18n.locale === 'zh' ? '用户信息不存在' : 'User information not found'
      );
      return;
    }

    try {
      await apiClient.updateInvitation(invitation.id, 'rejected', user.email);
      Alert.alert(
        i18n.locale === 'zh' ? '成功' : 'Success',
        i18n.locale === 'zh' ? '已拒绝邀请' : 'Invitation rejected'
      );
      loadInvitations();
    } catch (error) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        error.message || (i18n.locale === 'zh' ? '拒绝邀请时发生错误' : 'An error occurred while rejecting invitation')
      );
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return i18n.t('pending');
      case 'accepted':
        return i18n.t('accepted');
      case 'rejected':
        return i18n.t('rejected');
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ffa726';
      case 'accepted':
        return '#51cf66';
      case 'rejected':
        return '#ff6b6b';
      default:
        return '#999';
    }
  };

  const pendingInvitations = invitations.filter(i => i.status === 'pending');
  const otherInvitations = invitations.filter(i => i.status !== 'pending');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t('messages')}</Text>
      </View>

      <ScrollView style={styles.content}>
        {pendingInvitations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {i18n.locale === 'zh' ? '待处理邀请' : 'Pending Invitations'}
            </Text>
            {pendingInvitations.map((invitation) => (
              <View key={invitation.id} style={styles.invitationCard}>
                <View style={styles.invitationHeader}>
                  <Text style={styles.invitationGroupName}>{invitation.groupName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invitation.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(invitation.status)}</Text>
                  </View>
                </View>
                <Text style={styles.invitationText}>
                  {i18n.locale === 'zh' ? '邀请您加入群组' : 'Invited you to join the group'}
                </Text>
                <Text style={styles.invitationDate}>
                  {new Date(invitation.createdAt).toLocaleString()}
                </Text>
                <View style={styles.invitationActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAccept(invitation)}
                  >
                    <Text style={styles.acceptButtonText}>{i18n.t('accept')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(invitation)}
                  >
                    <Text style={styles.rejectButtonText}>{i18n.t('reject')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {otherInvitations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {i18n.locale === 'zh' ? '历史邀请' : 'Invitation History'}
            </Text>
            {otherInvitations.map((invitation) => (
              <View key={invitation.id} style={styles.invitationCard}>
                <View style={styles.invitationHeader}>
                  <Text style={styles.invitationGroupName}>{invitation.groupName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invitation.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(invitation.status)}</Text>
                  </View>
                </View>
                <Text style={styles.invitationDate}>
                  {new Date(invitation.createdAt).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {invitations.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {i18n.locale === 'zh' ? '暂无消息' : 'No messages'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
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
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  invitationCard: {
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
  invitationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  invitationGroupName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  invitationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  invitationDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 15,
  },
  invitationActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#51cf66',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rejectButton: {
    backgroundColor: '#ff6b6b',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

