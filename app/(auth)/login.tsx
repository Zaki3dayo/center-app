import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/providers/AuthProvider';

/**
 * ログイン画面（WF-06）
 * Google連携による匿名 → 認証済みへの移行フロー
 */
export default function LoginScreen() {
  const { linkWithGoogle, isLoading } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await linkWithGoogle();
    } catch (error: any) {
      if (error.code === 'auth/credential-already-in-use') {
        Alert.alert(
          'ログインエラー',
          'このGoogleアカウントはすでに別のアカウントで使用されています。別のGoogleアカウントで試してください。'
        );
      } else {
        Alert.alert('エラー', 'ログインに失敗しました。もう一度お試しください。');
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>データを引き継ぐ</Text>
      <Text style={styles.description}>
        Googleアカウントで連携すると、視聴データと診断履歴を引き継げます。
      </Text>
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleGoogleSignIn}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? '接続中...' : 'Googleで連携する'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  description: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
