import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

/**
 * フィード画面（WF-02）
 * Issue #20 で VideoPlayer + スワイプUIを実装予定
 */
export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.placeholder}>
        フィード画面（#20で実装予定）
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    color: '#fff',
    fontSize: 16,
  },
});
