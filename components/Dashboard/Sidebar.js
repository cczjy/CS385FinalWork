import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { GroupStorage } from '../../utils/storage';
import i18n from '../../utils/i18n';

export default function Sidebar({ groups, onGroupSelect, onRefresh, refreshKey, visible, onClose }) {
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'my', 'managed', 'joined'

  const filteredGroups = groups.filter(group => {
    // 搜索过滤
    if (searchText && !group.name.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    
    // 筛选过滤
    // 这里简化处理，实际应该根据用户角色判断
    return true;
  });

  const filterOptions = [
    { key: 'all', label: i18n.t('allGroups') },
    { key: 'my', label: i18n.t('myGroups') },
    { key: 'managed', label: i18n.t('managedGroups') },
    { key: 'joined', label: i18n.t('joinedGroups') },
  ];

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{i18n.t('groups')}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={i18n.t('search')}
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.filterContainer}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.filterButton, filter === option.key && styles.activeFilterButton]}
            onPress={() => setFilter(option.key)}
          >
            <Text style={[styles.filterText, filter === option.key && styles.activeFilterText]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.groupsList}>
        {filteredGroups.map((group) => (
          <TouchableOpacity
            key={group.id}
            style={styles.groupItem}
            onPress={() => onGroupSelect(group)}
          >
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.groupDescription} numberOfLines={1}>
              {group.description || i18n.locale === 'zh' ? '无描述' : 'No description'}
            </Text>
            <Text style={styles.groupMembers}>
              {group.members?.length || 0} {i18n.t('members')}
            </Text>
          </TouchableOpacity>
        ))}
        {filteredGroups.length === 0 && (
          <Text style={styles.emptyText}>
            {i18n.locale === 'zh' ? '暂无群组' : 'No groups'}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 28,
    color: '#666',
    lineHeight: 28,
  },
  searchContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    marginRight: 5,
    marginBottom: 5,
  },
  activeFilterButton: {
    backgroundColor: '#667eea',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  groupsList: {
    flex: 1,
  },
  groupItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  groupDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  groupMembers: {
    fontSize: 12,
    color: '#667eea',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
});

