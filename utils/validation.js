// 邮箱验证
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 密码验证（测试模式：只检查非空）
export const validatePassword = (password) => {
  if (!password) return false;
  if (password.length < 1) return false;
  return true;
};

// 获取密码验证错误信息（测试模式）
export const getPasswordError = (password) => {
  if (!password) return '密码不能为空';
  if (password.length < 1) return '密码不能为空';
  return null;
};

// 验证码生成（简单实现，实际应该从服务器获取）
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 存储验证码（临时）
const verificationCodes = {};

export const saveVerificationCode = (email, code) => {
  verificationCodes[email] = {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5分钟过期
  };
};

export const verifyCode = (email, code) => {
  const stored = verificationCodes[email];
  if (!stored) return false;
  if (Date.now() > stored.expiresAt) {
    delete verificationCodes[email];
    return false;
  }
  return stored.code === code;
};

