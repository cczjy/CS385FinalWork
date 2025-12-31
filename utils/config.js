/**
 * 应用配置管理
 * 用于管理API服务器地址等配置信息
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'app_config';

// 默认配置
const DEFAULT_CONFIG = {
  apiServerIp: null, // null表示未配置，将使用默认值
  apiServerPort: 8000,
};

/**
 * 获取完整的API配置
 */
export const getApiConfig = async () => {
  try {
    const configStr = await AsyncStorage.getItem(STORAGE_KEY);
    if (configStr) {
      const config = JSON.parse(configStr);
      return {
        ...DEFAULT_CONFIG,
        ...config,
      };
    }
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error('获取配置失败:', error);
    return DEFAULT_CONFIG;
  }
};

/**
 * 保存API配置
 */
export const saveApiConfig = async (config) => {
  try {
    const currentConfig = await getApiConfig();
    const newConfig = {
      ...currentConfig,
      ...config,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    return true;
  } catch (error) {
    console.error('保存配置失败:', error);
    return false;
  }
};

/**
 * 获取API服务器IP地址
 */
export const getApiServerIp = async () => {
  const config = await getApiConfig();
  return config.apiServerIp;
};

/**
 * 获取API服务器端口
 */
export const getApiServerPort = async () => {
  const config = await getApiConfig();
  return config.apiServerPort || 8000;
};

/**
 * 设置API服务器IP地址
 */
export const setApiServerIp = async (ip) => {
  return await saveApiConfig({ apiServerIp: ip });
};

/**
 * 设置API服务器端口
 */
export const setApiServerPort = async (port) => {
  return await saveApiConfig({ apiServerPort: port });
};

/**
 * 清除配置（使用默认值）
 */
export const clearApiConfig = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('清除配置失败:', error);
    return false;
  }
};

