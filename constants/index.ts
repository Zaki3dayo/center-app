/**
 * アプリ全体で使用する定数
 */

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';

/**
 * 視聴ログ取得設定（#21 実装フェーズで data-analyst と確認して確定）
 * completion_rate ポーリング間隔（ミリ秒）
 */
export const COMPLETION_RATE_POLLING_INTERVAL_MS = 2000;

/**
 * フィード設定
 */
export const FEED_PAGE_SIZE = 10;
