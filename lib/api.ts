import auth from '@react-native-firebase/auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/**
 * Firebase IDトークンを取得してAuthorizationヘッダーを返す
 * auth_design.md セクション2-3 に準拠
 * getIdToken() は期限切れ時に自動リフレッシュするため、明示的なリフレッシュ処理は不要
 */
async function getAuthHeader(): Promise<{ Authorization: string }> {
  const user = auth().currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

/**
 * 認証済みFetchラッパー
 */
async function authenticatedFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const authHeader = await getAuthHeader();
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options.headers,
    },
  });
}

/**
 * ユーザードキュメント初期化 API（auth_design.md セクション4-1）
 * バックエンドが #17 で実装されるまでの暫定実装
 */
export async function initUserApi(uid: string): Promise<void> {
  const response = await authenticatedFetch('/v1/users/init', {
    method: 'POST',
    body: JSON.stringify({ uid }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? `API error: ${response.status}`);
  }
}

/**
 * 視聴ログ送信 API（POST /v1/watch-logs）
 * 詳細実装は #21 で行う
 */
export async function postWatchLog(logData: {
  video_id: string;
  watch_time: number;
  swipe_time: number;
  completion_rate: number;
  rewatch: boolean;
  pause_count: number;
  video_genre?: string;
}): Promise<{ diagnosis_triggered: boolean }> {
  const response = await authenticatedFetch('/v1/watch-logs', {
    method: 'POST',
    body: JSON.stringify(logData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * フィード取得 API（GET /v1/feed）
 * 詳細実装は #20 で行う
 */
export async function getFeed(cursor?: string): Promise<{
  videos: Array<{
    video_id: string;
    title: string;
    thumbnail_url: string;
    duration: number;
    category_id: string;
  }>;
  next_cursor?: string;
}> {
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  const response = await authenticatedFetch(`/v1/feed${params}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? `API error: ${response.status}`);
  }

  return response.json();
}

export { authenticatedFetch };
