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
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../utils/api';
import { validateEmail, validatePassword } from '../utils/validation';
import i18n from '../utils/i18n';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = i18n.t('email') + ' ' + (i18n.locale === 'zh' ? '不能为空' : 'is required');
    } else if (!validateEmail(email)) {
      newErrors.email = i18n.locale === 'zh' ? '邮箱格式不正确' : 'Invalid email format';
    }
    
    if (!password) {
      newErrors.password = i18n.t('password') + ' ' + (i18n.locale === 'zh' ? '不能为空' : 'is required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      const user = await apiClient.login(email, password);
      
      // 保存用户信息（不再保存 token）
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      navigation.replace('Dashboard');
    } catch (error) {
      Alert.alert(
        i18n.locale === 'zh' ? '登录失败' : 'Login Failed',
        error.message || (i18n.locale === 'zh' ? '邮箱或密码错误' : 'Invalid email or password')
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
              <Text style={styles.title}>{i18n.t('login')}</Text>

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
                  placeholder={i18n.t('password')}
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

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>{i18n.t('login')}</Text>
              </TouchableOpacity>

              <View style={styles.linkContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.linkText}>{i18n.t('changePassword')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.linkText}>{i18n.t('register')}</Text>
                </TouchableOpacity>
              </View>
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
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
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
  loginButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  linkText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

