import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { UserStorage } from '../../utils/storage';
import { getApiConfig, setApiServerIp, setApiServerPort, clearApiConfig } from '../../utils/config';
import apiClient from '../../utils/api';
import i18n from '../../utils/i18n';

export default function SettingsView({ user, onUserUpdate, onLogout, onRefresh, refreshKey }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [language, setLanguage] = useState(i18n.locale);
  const [showServerConfigModal, setShowServerConfigModal] = useState(false);
  const [serverIp, setServerIp] = useState('');
  const [serverPort, setServerPort] = useState('8000');
  const [currentServerConfig, setCurrentServerConfig] = useState(null);

  useEffect(() => {
    loadServerConfig();
  }, []);

  const loadServerConfig = async () => {
    try {
      const config = await getApiConfig();
      setCurrentServerConfig(config);
      setServerIp(config.apiServerIp || '');
      setServerPort(config.apiServerPort?.toString() || '8000');
    } catch (error) {
      console.error('加载服务器配置失败:', error);
    }
  };

  const handleSaveServerConfig = async () => {
    try {
      // 验证IP地址格式（简单验证）
      if (serverIp && !/^(\d{1,3}\.){3}\d{1,3}$/.test(serverIp.trim())) {
        Alert.alert(
          i18n.locale === 'zh' ? '错误' : 'Error',
          i18n.locale === 'zh' ? 'IP地址格式不正确' : 'Invalid IP address format'
        );
        return;
      }

      // 验证端口号
      const port = parseInt(serverPort, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        Alert.alert(
          i18n.locale === 'zh' ? '错误' : 'Error',
          i18n.locale === 'zh' ? '端口号必须在1-65535之间' : 'Port must be between 1 and 65535'
        );
        return;
      }

      // 保存配置
      if (serverIp.trim()) {
        await setApiServerIp(serverIp.trim());
      } else {
        // 如果IP为空，清除配置使用默认值
        await clearApiConfig();
      }
      await setApiServerPort(port);

      // 清除API客户端的缓存，使其使用新配置
      apiClient.clearBaseURLCache();

      Alert.alert(
        i18n.locale === 'zh' ? '成功' : 'Success',
        i18n.locale === 'zh' ? '服务器配置已保存' : 'Server configuration saved',
        [
          {
            text: i18n.locale === 'zh' ? '确定' : 'OK',
            onPress: () => {
              setShowServerConfigModal(false);
              loadServerConfig();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        i18n.locale === 'zh' ? '保存配置时发生错误' : 'An error occurred while saving configuration'
      );
    }
  };

  const handleResetServerConfig = async () => {
    Alert.alert(
      i18n.locale === 'zh' ? '确认重置' : 'Confirm Reset',
      i18n.locale === 'zh' ? '确定要重置服务器配置为默认值吗？' : 'Are you sure you want to reset server configuration to default?',
      [
        {
          text: i18n.locale === 'zh' ? '取消' : 'Cancel',
          style: 'cancel',
        },
        {
          text: i18n.locale === 'zh' ? '重置' : 'Reset',
          onPress: async () => {
            await clearApiConfig();
            apiClient.clearBaseURLCache();
            loadServerConfig();
            Alert.alert(
              i18n.locale === 'zh' ? '成功' : 'Success',
              i18n.locale === 'zh' ? '配置已重置' : 'Configuration reset'
            );
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    try {
      const updated = await UserStorage.updateUser(user.id, {
        username,
        email,
      });

      if (updated) {
        Alert.alert(
          i18n.locale === 'zh' ? '成功' : 'Success',
          i18n.locale === 'zh' ? '信息已更新' : 'Information updated'
        );
        setShowEditModal(false);
        onUserUpdate();
      }
    } catch (error) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        i18n.locale === 'zh' ? '更新信息时发生错误' : 'An error occurred while updating information'
      );
    }
  };

  const handleLanguageChange = (lang) => {
    i18n.locale = lang;
    setLanguage(lang);
    onRefresh();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t('settings')}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {i18n.locale === 'zh' ? '个人信息' : 'Personal Information'}
          </Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{i18n.t('username')}</Text>
              <Text style={styles.infoValue}>{user?.username || i18n.locale === 'zh' ? '未设置' : 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{i18n.t('email')}</Text>
              <Text style={styles.infoValue}>{user?.email || ''}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                setUsername(user?.username || '');
                setEmail(user?.email || '');
                setShowEditModal(true);
              }}
            >
              <Text style={styles.editButtonText}>{i18n.t('edit')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('language')}</Text>
          
          <View style={styles.languageCard}>
            <TouchableOpacity
              style={[styles.languageOption, language === 'zh' && styles.activeLanguageOption]}
              onPress={() => handleLanguageChange('zh')}
            >
              <Text style={[styles.languageText, language === 'zh' && styles.activeLanguageText]}>
                {i18n.t('chinese')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.languageOption, language === 'en' && styles.activeLanguageOption]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={[styles.languageText, language === 'en' && styles.activeLanguageText]}>
                {i18n.t('english')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {i18n.locale === 'zh' ? '服务器配置' : 'Server Configuration'}
          </Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {i18n.locale === 'zh' ? '服务器IP' : 'Server IP'}
              </Text>
              <Text style={styles.infoValue}>
                {currentServerConfig?.apiServerIp || (i18n.locale === 'zh' ? '默认' : 'Default')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {i18n.locale === 'zh' ? '端口' : 'Port'}
              </Text>
              <Text style={styles.infoValue}>
                {currentServerConfig?.apiServerPort || 8000}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                loadServerConfig();
                setShowServerConfigModal(true);
              }}
            >
              <Text style={styles.editButtonText}>
                {i18n.locale === 'zh' ? '配置服务器' : 'Configure Server'}
              </Text>
            </TouchableOpacity>
            {currentServerConfig?.apiServerIp && (
              <TouchableOpacity
                style={[styles.editButton, styles.resetButton]}
                onPress={handleResetServerConfig}
              >
                <Text style={[styles.editButtonText, styles.resetButtonText]}>
                  {i18n.locale === 'zh' ? '重置为默认' : 'Reset to Default'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutButtonText}>{i18n.t('logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {i18n.locale === 'zh' ? '编辑个人信息' : 'Edit Personal Information'}
            </Text>
            
            <Text style={styles.modalLabel}>{i18n.t('username')}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={i18n.t('username')}
              value={username}
              onChangeText={setUsername}
            />

            <Text style={styles.modalLabel}>{i18n.t('email')}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={i18n.t('email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>{i18n.t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSave}
              >
                <Text style={styles.submitButtonText}>{i18n.t('save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showServerConfigModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowServerConfigModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {i18n.locale === 'zh' ? '配置服务器' : 'Configure Server'}
            </Text>
            
            <Text style={styles.modalLabel}>
              {i18n.locale === 'zh' ? '服务器IP地址' : 'Server IP Address'}
            </Text>
            <Text style={styles.modalHint}>
              {i18n.locale === 'zh' 
                ? '留空使用默认IP (192.168.4.23)' 
                : 'Leave empty to use default IP (192.168.4.23)'}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder={i18n.locale === 'zh' ? '例如: 192.168.1.100' : 'e.g. 192.168.1.100'}
              value={serverIp}
              onChangeText={setServerIp}
              keyboardType="numeric"
              autoCapitalize="none"
            />

            <Text style={styles.modalLabel}>
              {i18n.locale === 'zh' ? '端口号' : 'Port'}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="8000"
              value={serverPort}
              onChangeText={setServerPort}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowServerConfigModal(false)}
              >
                <Text style={styles.cancelButtonText}>{i18n.t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSaveServerConfig}
              >
                <Text style={styles.submitButtonText}>{i18n.t('save')}</Text>
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
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  editButton: {
    backgroundColor: '#667eea',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  languageCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageOption: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  activeLanguageOption: {
    backgroundColor: '#667eea',
  },
  languageText: {
    fontSize: 16,
    color: '#666',
  },
  activeLanguageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
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
  modalHint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    marginTop: -5,
  },
  resetButton: {
    backgroundColor: '#ff6b6b',
    marginTop: 10,
  },
  resetButtonText: {
    color: '#fff',
  },
});

