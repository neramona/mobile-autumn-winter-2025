import React, { useState, useMemo } from 'react'
import { View, Text, Button, StyleSheet, TextInput, Keyboard } from 'react-native'

const expensiveFib = (n) => {
  let a = 0, b = 1
  for (let i = 0; i < n; i++) {
    const next = a + b
    a = b
    b = next
  }
  return a
}

const UseMemoDemo = ({ navigate }) => {
  const [n, setN] = useState(20)

  const fib = useMemo(() => expensiveFib(n), [n])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>useMemo</Text>
      <Text style={{ fontSize: 16, marginVertical: 8 }}>n: {n}</Text>
      <Text style={{ fontSize: 18, marginVertical: 8 }}>fib(n): {fib}</Text>
      <View style={{ height: 8 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Button title="-" onPress={() => setN(v => Math.max(0, v - 1))} />
        <View style={{ width: 12 }} />
        <Button title="+" onPress={() => setN(v => v + 1)} />
      </View>
      <View style={{ height: 12 }} />
      <TextInput
        keyboardType="numeric"
        returnKeyType="done"  
        onSubmitEditing={() => Keyboard.dismiss()}
        value={String(n)}
        onChangeText={txt => {
          const num = parseInt(txt || '0', 10)
          if (!Number.isNaN(num)) setN(num)
        }}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginVertical: 8, borderRadius: 4 }}
      />
      <Button title="Назад" onPress={() => navigate('main')} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, marginBottom: 10, textAlign: 'center' },
})

export default UseMemoDemo
