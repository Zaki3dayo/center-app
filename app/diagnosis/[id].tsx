import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * 詳細診断画面（WF-04）
 * Issue #23 で実装予定
 * - 縦スクロール禁止・文字数上限で1画面設計
 * - ← 左スワイプでフィードへ戻る
 */
export default function DiagnosisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.placeholder}>
        詳細診断画面（#23で実装予定）
      </Text>
      <Text style={styles.id}>diagnosis ID: {id}</Text>
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
  placeholder: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  id: {
    color: '#666',
    fontSize: 12,
  },
});
