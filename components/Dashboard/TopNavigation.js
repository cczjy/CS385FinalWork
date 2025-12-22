import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import i18n from '../../utils/i18n';

export default function TopNavigation({ currentView, onViewChange, onMenuPress }) {
  const navItems = [
    { key: 'home', label: i18n.t('dashboard') },
    { key: 'filter', label: i18n.locale === 'zh' ? '筛选' : 'Filter' },
    { key: 'messages', label: i18n.t('messages') },
    { key: 'settings', label: i18n.t('settings') },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[styles.navItem, currentView === item.key && styles.activeNavItem]}
          onPress={() => onViewChange(item.key)}
        >
          <Text style={[styles.navText, currentView === item.key && styles.activeNavText]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  menuButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 5,
  },
  menuIcon: {
    fontSize: 24,
    color: '#667eea',
    fontWeight: 'bold',
  },
  navItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  activeNavItem: {
    backgroundColor: '#667eea',
  },
  navText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

