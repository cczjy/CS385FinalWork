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
import apiClient from '../utils/api';
import { validateEmail, validatePassword, getPasswordError } from '../utils/validation';
import i18n from '../utils/i18n';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!username) {
      newErrors.username = i18n.t('username') + ' ' + (i18n.locale === 'zh' ? '不能为空' : 'is required');
    }
    
    if (!email) {
      newErrors.email = i18n.t('email') + ' ' + (i18n.locale === 'zh' ? '不能为空' : 'is required');
    } else if (!validateEmail(email)) {
      newErrors.email = i18n.locale === 'zh' ? '邮箱格式不正确' : 'Invalid email format';
    }
    
    if (!password) {
      newErrors.password = i18n.t('password') + ' ' + (i18n.locale === 'zh' ? '不能为空' : 'is required');
    } else {
      const passwordError = getPasswordError(password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = i18n.locale === 'zh' ? '两次密码不一致' : 'Passwords do not match';
    }
    
    if (!verificationCode) {
      newErrors.verificationCode = i18n.t('verificationCode') + ' ' + (i18n.locale === 'zh' ? '不能为空' : 'is required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGetCode = async () => {
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
    
    try {
      const response = await apiClient.getVerificationCode(email);
      // 开发环境会返回验证码
      Alert.alert(
        i18n.locale === 'zh' ? '验证码' : 'Verification Code',
        i18n.locale === 'zh' ? `验证码：${response.code}` : `Code: ${response.code}`
      );
    } catch (error) {
      Alert.alert(
        i18n.locale === 'zh' ? '错误' : 'Error',
        error.message || (i18n.locale === 'zh' ? '获取验证码失败' : 'Failed to get verification code')
      );
    }
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      const user = await apiClient.register({
        username,
        email,
        password,
        verification_code: verificationCode,
      });

      if (user) {
        Alert.alert(
          i18n.locale === 'zh' ? '注册成功' : 'Success',
          i18n.locale === 'zh' ? '注册成功，请登录' : 'Registration successful, please login',
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
        i18n.locale === 'zh' ? '注册失败' : 'Registration Failed',
        error.message || (i18n.locale === 'zh' ? '注册时发生错误' : 'An error occurred during registration')
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
              <Text style={styles.title}>{i18n.t('register')}</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{i18n.t('username')}</Text>
                <TextInput
                  style={[styles.input, errors.username && styles.inputError]}
                  placeholder={i18n.t('username')}
                  placeholderTextColor="#999"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (errors.username) setErrors({ ...errors, username: null });
                  }}
                  autoCapitalize="none"
                />
                {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
              </View>

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
                <Text style={styles.label}>{i18n.t('password')}</Text>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder={i18n.locale === 'zh' ? '至少6位' : 'At least 6 characters'}
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: null });
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
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

              <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                <Text style={styles.registerButtonText}>{i18n.t('submit')}</Text>
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
  registerButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonText: {
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

