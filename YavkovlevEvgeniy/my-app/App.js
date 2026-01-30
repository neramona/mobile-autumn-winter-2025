import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuthStore } from './hooks/useAuthStore';
import RegisterScreen from './components/RegisterScreen';
import LoginScreen from './components/LoginScreen';
import MainScreen from './components/MainScreen';
import PostsScreen from './components/PostsScreen';
import UseMemo from './components/UseMemo';
import UseStateEffect from './components/UseStateEffect';

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [route, setRoute] = useState(isAuthenticated ? 'main' : 'login');

  useEffect(() => {
    if (isAuthenticated) {
      setRoute((r) => (r === 'login' || r === 'register' ? 'main' : r));
    } else {
      setRoute('login');
    }
  }, [isAuthenticated]);

  const navigate = useCallback((to) => setRoute(to), []);

  const screen = useMemo(() => {
    if (!isAuthenticated) {
      if (route === 'register') return <RegisterScreen navigate={navigate} />;
      return <LoginScreen navigate={navigate} />;
    }

    switch (route) {
      case 'main':
        return <MainScreen navigate={navigate} />;
      case 'posts':
        return <PostsScreen navigate={navigate} />;
      case 'useMemo':
        return <UseMemo navigate={navigate} />;
      case 'useStateEffect':
        return <UseStateEffect navigate={navigate} />;
      default:
        return <MainScreen navigate={navigate} />;
    }
  }, [isAuthenticated, route, navigate]);

  return <View style={styles.container}>{screen}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
});