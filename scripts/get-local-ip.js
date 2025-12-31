/**
 * 自动检测本机 IP 地址
 * 用于在启动 Expo 应用时自动获取当前机器的 IP 地址
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * 获取本机的局域网 IP 地址
 * 优先返回 IPv4 地址，排除内部回环地址和虚拟网络接口
 */
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  // 遍历所有网络接口
  for (const name of Object.keys(interfaces)) {
    // 跳过某些虚拟或无效接口
    if (name.includes('Loopback') || name.includes('Virtual') || name.includes('VMware')) {
      continue;
    }

    for (const iface of interfaces[name]) {
      // 只获取 IPv4 地址，且不是内部地址
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          name: name,
          address: iface.address,
        });
      }
    }
  }

  // 优先选择以太网或 WiFi 接口
  const priorityInterfaces = ['Ethernet', 'Wi-Fi', 'WiFi', 'WLAN', 'en0', 'eth0'];
  
  for (const priorityName of priorityInterfaces) {
    const found = addresses.find(addr => 
      addr.name.includes(priorityName) || addr.name === priorityName
    );
    if (found) {
      return found.address;
    }
  }

  // 如果没有找到优先接口，返回第一个找到的地址
  if (addresses.length > 0) {
    return addresses[0].address;
  }

  // 如果都没找到，返回默认值
  return '192.168.4.23';
}

/**
 * 将 IP 地址保存到配置文件
 */
function saveIPToConfig(ip, port = 8000) {
  const configDir = path.join(__dirname, '..');
  const configFile = path.join(configDir, 'api-config.json');
  
  const config = {
    apiServerIp: ip,
    apiServerPort: port,
    lastUpdated: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf8');
    console.log(`✅ 已检测到本机 IP: ${ip}`);
    console.log(`✅ 配置文件已保存: ${configFile}`);
    return true;
  } catch (error) {
    console.error('❌ 保存配置文件失败:', error.message);
    return false;
  }
}

// 主函数
function main() {
  console.log('🔍 正在检测本机 IP 地址...');
  const localIP = getLocalIP();
  saveIPToConfig(localIP);
  return localIP;
}

// 如果直接运行此脚本，执行主函数
if (require.main === module) {
  main();
}

module.exports = { getLocalIP, saveIPToConfig };

