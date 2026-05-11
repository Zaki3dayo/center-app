import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { initUserDocument } from '@/lib/firestore';

/**
 * 認証コンテキスト（auth_design.md セクション2-2 に準拠）
 */
interface AuthContextValue {
  user: FirebaseAuthTypes.User | null;
  isAnonymous: boolean;
  isLoading: boolean;
  signInAnonymously: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  linkWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Google Sign-In 初期化
  useEffect(() => {
    const webClientId = Constants.expoConfig?.extra?.googleWebClientId
      ?? process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

    if (webClientId) {
      GoogleSignin.configure({
        webClientId,
      });
    } else {
      console.warn('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not set. Google Sign-In will not work.');
    }
  }, []);

  // Firebase Auth の状態変化を監視
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        // 未認証の場合は匿名ログインを実行
        try {
          const credential = await auth().signInAnonymously();
          // 初回ログイン時にFirestoreのユーザードキュメントを初期化
          await initUserDocument(credential.user.uid);
        } catch (error) {
          console.error('Anonymous sign-in failed:', error);
          setIsLoading(false);
        }
      } else {
        setUser(firebaseUser);
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signInAnonymously = async () => {
    const credential = await auth().signInAnonymously();
    await initUserDocument(credential.user.uid);
  };

  /**
   * Google Sign-In（新規ログイン・Google連携済みアカウントへの再ログイン）
   */
  const signInWithGoogle = async () => {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const signInResult = await GoogleSignin.signIn();
    const { idToken } = await GoogleSignin.getTokens();
    if (!idToken) throw new Error('No ID token from Google Sign-In');

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const result = await auth().signInWithCredential(googleCredential);
    await initUserDocument(result.user.uid);
  };

  /**
   * 匿名ユーザーをGoogleアカウントに連携（auth_design.md セクション1-2 に準拠）
   * UID は変わらない。既存の視聴データはそのまま引き継がれる。
   */
  const linkWithGoogle = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) throw new Error('No current user');

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const signInResult = await GoogleSignin.signIn();
    const { idToken } = await GoogleSignin.getTokens();
    if (!idToken) throw new Error('No ID token from Google Sign-In');

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // linkWithCredential でUIDを変えずにGoogleアカウントを紐付け
    // エラー: auth/credential-already-in-use の場合は呼び出し元でハンドリング
    await currentUser.linkWithCredential(googleCredential);

    // Firestoreのユーザードキュメントを更新（バックエンドAPIへの委譲は #17完了後）
    // TODO: POST /v1/auth/link-google を呼び出してFirestoreを更新する（#17完了後）
  };

  const signOut = async () => {
    await auth().signOut();
    await GoogleSignin.signOut();
  };

  const value: AuthContextValue = {
    user,
    isAnonymous: user?.isAnonymous ?? true,
    isLoading,
    signInAnonymously,
    signInWithGoogle,
    linkWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
