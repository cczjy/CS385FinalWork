import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../utils/api';
import i18n from '../utils/i18n';

// 导入子组件
import TopNavigation from '../components/Dashboard/TopNavigation';
import Sidebar from '../components/Dashboard/Sidebar';
import HomeView from '../components/Dashboard/HomeView';
import GroupDetailView from '../components/Dashboard/GroupDetailView';
import MessagesView from '../components/Dashboard/MessagesView';
import SettingsView from '../components/Dashboard/SettingsView';

export default function DashboardScreen({ navigation }) {
  const [currentView, setCurrentView] = useState('home');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    loadUserData();
    
    // 每5分钟自动刷新
    const refreshInterval = setInterval(() => {
      refreshData();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadGroups();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setUser(userData);
      } else {
        // 如果没有本地数据，跳转到登录页
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('Load user data error:', error);
    }
  };

  const loadGroups = async () => {
    try {
      if (!user || !user.id) {
        return;
      }
      const userGroups = await apiClient.getUserGroups(user.id);
      setGroups(userGroups);
    } catch (error) {
      console.error('Load groups error:', error);
    }
  };

  const refreshData = async () => {
    await loadUserData();
    await loadGroups();
    setRefreshKey(prev => prev + 1);
  };

  const handleLogout = async () => {
    Alert.alert(
      i18n.locale === 'zh' ? '确认退出' : 'Confirm Logout',
      i18n.locale === 'zh' ? '确定要退出登录吗？' : 'Are you sure you want to logout?',
      [
        {
          text: i18n.t('cancel'),
          style: 'cancel',
        },
        {
          text: i18n.t('logout'),
          onPress: async () => {
            await AsyncStorage.removeItem('userData');
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setCurrentView('groupDetail');
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomeView
            user={user}
            groups={groups}
            onGroupSelect={handleGroupSelect}
            onRefresh={refreshData}
            refreshKey={refreshKey}
          />
        );
      case 'groupDetail':
        return (
          <GroupDetailView
            group={selectedGroup}
            user={user}
            onBack={() => setCurrentView('home')}
            onRefresh={refreshData}
            refreshKey={refreshKey}
          />
        );
      case 'messages':
        return (
          <MessagesView
            user={user}
            onRefresh={refreshData}
            refreshKey={refreshKey}
          />
        );
      case 'settings':
        return (
          <SettingsView
            user={user}
            onUserUpdate={loadUserData}
            onLogout={handleLogout}
            onRefresh={refreshData}
            refreshKey={refreshKey}
          />
        );
      default:
        return <HomeView user={user} groups={groups} onGroupSelect={handleGroupSelect} onRefresh={refreshData} refreshKey={refreshKey} />;
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{i18n.locale === 'zh' ? '加载中...' : 'Loading...'}</Text>
      </View>
    );
  }

  const navItems = [
    { key: 'home', label: i18n.locale === 'zh' ? '主页' : 'Home', icon: '🏠' },
    { key: 'messages', label: i18n.t('messages'), icon: '💬' },
    { key: 'settings', label: i18n.t('settings'), icon: '⚙️' },
  ];

  const handleNavPress = (key) => {
    if (key === 'home') {
      // 如果当前在群组详情页，返回主页
      if (currentView === 'groupDetail') {
        setCurrentView('home');
        setSelectedGroup(null);
      } else {
        setCurrentView('home');
      }
    } else {
      setCurrentView(key);
    }
  };

  return (
    <View style={styles.container}>
      <TopNavigation
        onMenuPress={() => setSidebarVisible(!sidebarVisible)}
      />
      <View style={styles.contentContainer}>
        <Sidebar
          groups={groups}
          onGroupSelect={(group) => {
            handleGroupSelect(group);
            setSidebarVisible(false);
          }}
          onRefresh={refreshData}
          refreshKey={refreshKey}
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
        />
        <View style={styles.mainContent}>
          {renderMainContent()}
        </View>
        {sidebarVisible && (
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setSidebarVisible(false)}
          />
        )}
      </View>
      <View style={styles.bottomNav}>
        {navItems.map((item) => {
          const isActive = currentView === item.key || (item.key === 'home' && currentView === 'groupDetail');
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.bottomNavItem,
                isActive && styles.activeBottomNavItem,
              ]}
              onPress={() => handleNavPress(item.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.bottomNavIcon, isActive && styles.activeBottomNavIcon]}>
                {item.icon}
              </Text>
              <Text
                style={[
                  styles.bottomNavText,
                  isActive && styles.activeBottomNavText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeBottomNavItem: {
    backgroundColor: '#f0f4ff',
  },
  bottomNavIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.7,
  },
  activeBottomNavIcon: {
    opacity: 1,
  },
  bottomNavText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  activeBottomNavText: {
    color: '#667eea',
    fontWeight: 'bold',
  },
});

