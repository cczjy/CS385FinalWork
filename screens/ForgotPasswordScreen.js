import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { UserStorage } from '../utils/storage';
import { validateEmail, validatePassword, generateVerificationCode, saveVerificationCode, verifyCode } from '../utils/validation';
import i18n from '../utils/i18n';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = i18n.t('email') + ' ' + (i18n.locale === 'zh' ? '不能为空' : 'is required');
    } else if (!validateEmail(email)) {
      newErrors.email = i18n.locale === 'zh' ? '邮箱格式不正确' : 'Invalid email format';
    }
    
    if (!verificationCode) {
      newErrors.verificationCode = i18n.t('verificationCode') + ' ' + (i18n.locale === 'zh' ? '不能为空' : 'is required');
    }
    
    if (!oldPassword) {
      newErrors.oldPassword = i18n.t('oldPassword') + ' ' + (i18n.locale === 'zh' ? '不能为空' : 'is required');
    }
    
    if (!newPassword) {
      newErrors.newPassword = i18n.t('newPassword') + ' ' + (i18n.locale === 'zh' ? '不能为空' : 'is required');
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = i18n.locale === 'zh' ? '密码长度至少6位' : 'Password must be at least 6 characters';
    }
    
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = i18n.locale === 'zh' ? '两次密码不一致' : 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGetCode = () => {
    if (!email) {
      Alert.alert(
        i18n.locale === 'zh' ? '提示' : 'Notice',
        i18n.locale === 'zh' ? '请先输入邮箱' : 'Please enter email first'
      );
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert(
        i18n.locale === 'zh' ? '提示' : 'Notice',
        i18n.locale === 'zh' ? '邮箱格式不正确' : 'Invalid email format'
      );
      return;
    }
    
    const code = generateVerificationCode();
    saveVerificationCode(email, code);
    Alert.alert(
      i18n.locale === 'zh' ? '验证码' : 'Verification Code',
      i18n.locale === 'zh' ? `验证码：${code}` : `Code: ${code}`
    );
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    // 验证验证码
    if (!verifyCode(email, verificationCode)) {
      Alert.alert(
        i18n.locale === 'zh' ? '验证失败' : 'Verification Failed',
        i18n.locale === 'zh' ? '验证码错误或已过期' : 'Invalid or expired verification code'
      );
      return;
    }

    try {
      // 验证原密码
      const users = await UserStorage.getAllUsers();
      const user = users.find(u => u.email === email);
      
      if (!user) {
        Alert.alert(
          i18n.locale === 'zh' ? '错误' : 'Error',
          i18n.locale === 'zh' ? '用户不存在' : 'User not found'
        );
        return;
      }

      if (user.password !== oldPassword) {
        Alert.alert(
          i18n.locale === 'zh' ? '错误' : 'Error',
          i18n.locale === 'zh' ? '原密码错误' : 'Incorrect old password'
        );
        return;
      }

      // 更新密码
      const updated = await UserStorage.updateUser(user.id, { password: newPassword });
      
      if (updated) {
        Alert.alert(
          i18n.locale === 'zh' ? '成功' : 'Success',
          i18n.locale === 'zh' ? '密码修改成功' : 'Password changed successfully',
          [
            {
              text: i18n.t('login'),
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        i18n.locale === 'zh' ? '修改密码时发生错误' : 'An error occurred while changing password'
      );
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <BlurView intensity={80} style={styles.blurContainer}>
            <View style={styles.content}>
              <Text style={styles.title}>{i18n.t('changePassword')}</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{i18n.t('email')}</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder={i18n.t('email')}
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{i18n.t('verificationCode')}</Text>
                <View style={styles.codeContainer}>
                  <TextInput
                    style={[styles.codeInput, errors.verificationCode && styles.inputError]}
                    placeholder={i18n.t('verificationCode')}
                    placeholderTextColor="#999"
                    value={verificationCode}
                    onChangeText={(text) => {
                      setVerificationCode(text);
                      if (errors.verificationCode) setErrors({ ...errors, verificationCode: null });
                    }}
                    keyboardType="number-pad"
                  />
                  <TouchableOpacity style={styles.codeButton} onPress={handleGetCode}>
                    <Text style={styles.codeButtonText}>{i18n.t('getCode')}</Text>
                  </TouchableOpacity>
                </View>
                {errors.verificationCode && <Text style={styles.errorText}>{errors.verificationCode}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{i18n.t('oldPassword')}</Text>
                <TextInput
                  style={[styles.input, errors.oldPassword && styles.inputError]}
                  placeholder={i18n.t('oldPassword')}
                  placeholderTextColor="#999"
                  value={oldPassword}
                  onChangeText={(text) => {
                    setOldPassword(text);
                    if (errors.oldPassword) setErrors({ ...errors, oldPassword: null });
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                />
                {errors.oldPassword && <Text style={styles.errorText}>{errors.oldPassword}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{i18n.t('newPassword')}</Text>
                <TextInput
                  style={[styles.input, errors.newPassword && styles.inputError]}
                  placeholder={i18n.locale === 'zh' ? '至少6位' : 'At least 6 characters'}
                  placeholderTextColor="#999"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (errors.newPassword) setErrors({ ...errors, newPassword: null });
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                />
                {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{i18n.t('confirmPassword')}</Text>
                <TextInput
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  placeholder={i18n.t('confirmPassword')}
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                />
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleChangePassword}>
                <Text style={styles.submitButtonText}>{i18n.t('submit')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.backButtonText}>
                  {i18n.locale === 'zh' ? '返回登录' : 'Back to Login'}
                </Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: '100%',
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    padding: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 5,
  },
  codeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  codeInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  codeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

