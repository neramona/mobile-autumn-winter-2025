import React from 'react'
import { View, Text, Button, StyleSheet } from 'react-native'
import { useAuthStore } from '../hooks/useAuthStore'

const MainScreen = ({ navigate }) => {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <View style={styles.container}>
      <View style={{ justifyContent: 'center', flex: 1 }}>
        <Text style={styles.title}>Главный экран</Text>
        <Text style={{ marginBottom: 10 }}>Добро пожаловать, {user?.name ?? 'гость'}!</Text>

        <View style={{ height: 10 }} />
        <Button title="useMemo" onPress={() => navigate('useMemo')} />
        <View style={{ height: 10 }} />
        <Button title="useState и useEffect" onPress={() => navigate('useStateEffect')} />
        <View style={{ height: 10 }} />
        <Button title="POST" onPress={() => navigate('posts')} />
      </View>
      <View style={styles.footer}>
        <Button title="Выйти" onPress={logout} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  footer: { paddingTop: 10 },
})

export default MainScreen
