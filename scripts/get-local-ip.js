/**
 * 自动检测本机 IP 地址
 * 用于在启动 Expo 应用时自动获取当前机器的 IP 地址
 */

const os = require('os');
const fs = require('fs');
const path = require('path');


function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const addresses = [];


  for (const name of Object.keys(interfaces)) {
    // 跳过某些虚拟或无效接口
    if (name.includes('Loopback') || name.includes('Virtual') || name.includes('VMware')) {
      continue;
    }

    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          name: name,
          address: iface.address,
        });
      }
    }
  }


  const priorityInterfaces = ['Ethernet', 'Wi-Fi', 'WiFi', 'WLAN', 'en0', 'eth0'];
  
  for (const priorityName of priorityInterfaces) {
    const found = addresses.find(addr => 
      addr.name.includes(priorityName) || addr.name === priorityName
    );
    if (found) {
      return found.address;
    }
  }


  if (addresses.length > 0) {
    return addresses[0].address;
  }


  return '192.168.4.23';
}


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


function main() {
  console.log('🔍 正在检测本机 IP 地址...');
  const localIP = getLocalIP();
  saveIPToConfig(localIP);
  return localIP;
}


if (require.main === module) {
  main();
}

module.exports = { getLocalIP, saveIPToConfig };

