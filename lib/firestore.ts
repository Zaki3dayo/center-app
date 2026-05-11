import firestore from '@react-native-firebase/firestore';

/**
 * ユーザードキュメントの初期化（auth_design.md セクション4-1 に準拠）
 * 冪等性あり：ドキュメントが既に存在する場合はスキップする
 */
export async function initUserDocument(uid: string): Promise<void> {
  const userRef = firestore().collection('users').doc(uid);
  const userDoc = await userRef.get();

  if (userDoc.exists()) {
    // 既に初期化済み：last_active_at のみ更新
    await userRef.update({
      last_active_at: firestore.FieldValue.serverTimestamp(),
    });
    return;
  }

  // 初回：ユーザードキュメントを作成（db_design.md セクション2-1 に準拠）
  await userRef.set({
    uid,
    display_name: null,
    auth_provider: 'anonymous',
    email: null,
    created_at: firestore.FieldValue.serverTimestamp(),
    last_active_at: firestore.FieldValue.serverTimestamp(),
    diagnosis_count: 0,
    total_log_count: 0,
    last_bias_check_log_count: null,
    linked_at: null,
    onboarding_consent_shown_at: null,
    plan_type: 'free',
  });
}

/**
 * 視聴ログの書き込み（POST /v1/watch-logs のフォールバック用）
 * 本実装は #21 で行う
 */
export async function writeWatchLog(
  uid: string,
  logData: {
    video_id: string;
    watch_time: number;
    swipe_time: number;
    completion_rate: number;
    rewatch: boolean;
    pause_count: number;
    video_genre?: string;
  }
): Promise<void> {
  const logsRef = firestore()
    .collection('users')
    .doc(uid)
    .collection('watch_logs');

  await logsRef.add({
    ...logData,
    recorded_at: firestore.FieldValue.serverTimestamp(),
  });
}
