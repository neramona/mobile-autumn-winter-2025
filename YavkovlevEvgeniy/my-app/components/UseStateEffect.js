import React, { useState, useEffect } from 'react'
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native'
import { useUserState } from '../hooks/useUserState'
import NameInput from './NameInput'
import AgeInput from './AgeInput'
import SubscriptionToggle from './SubscriptionToggle'
import HobbyButtons from './HobbyButtons'
import UserInfoDisplay from './UserInfoDisplay'

const UseStateEffect = ({ navigate }) => {
  const {
    name,
    setName,
    age,
    setAge,
    isSubscribed,
    setIsSubscribed,
    hobbies,
    addHobby,
  } = useUserState()

  const [logs, setLogs] = useState([])

  useEffect(() => {
    const log = `[${new Date().toLocaleTimeString()}] Компонент смонтирован`
    setLogs((prev) => [log, ...prev])
    return () => {
      const logOut = `[${new Date().toLocaleTimeString()}] Компонент размонтирован`
      console.log('Компонент размонтирован')
      setLogs((prev) => [logOut, ...prev])
    }
  }, [])

  useEffect(() => {
    const log = `[${new Date().toLocaleTimeString()}] Список хобби обновлён: ${JSON.stringify(hobbies)}`
    setLogs((prev) => [log, ...prev])
    console.log('Список хобби обновлён:', hobbies)
  }, [hobbies])

  useEffect(() => {
    if (name && age > 0) {
      const log = `[${new Date().toLocaleTimeString()}] Пользователь: ${name}, Возраст: ${age}`
      setLogs((prev) => [log, ...prev])
      console.log(`Пользователь: ${name}, Возраст: ${age}`)
    }
  }, [name, age])

  useEffect(() => {
    const status = isSubscribed ? 'активна' : 'неактивна'
    const log = `[${new Date().toLocaleTimeString()}] Статус кнопки: ${status}`
    setLogs((prev) => [log, ...prev])
    console.log(`Статус кнопки: ${status}`)
  }, [isSubscribed])

  const clearLogs = () => {
    const log = `[${new Date().toLocaleTimeString()}] Логи очищены`
    setLogs([log])
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>useEffect и useEffect</Text>

      <View style={styles.controlsSection}>
        <Text style={styles.sectionTitle}>useState:</Text>
        <NameInput value={name} onChangeText={setName} />
        <AgeInput value={age} onChangeText={setAge} />
        <SubscriptionToggle value={isSubscribed} onValueChange={setIsSubscribed} />
        <HobbyButtons onAddHobby={addHobby} />
        <UserInfoDisplay name={name} age={age} isSubscribed={isSubscribed} hobbies={hobbies} />
      </View>

      <View style={styles.logsSection}>
        <View style={styles.logsHeader}>
          <Text style={styles.sectionTitle}>useEffect:</Text>
          <Button title="Очистить" onPress={clearLogs} />
        </View>

        <ScrollView style={styles.logsContainer}>
          {logs.length === 0 ? (
            <Text style={styles.noLogs}>Нет логов.</Text>
          ) : (
            logs.map((log, index) => (
              <Text key={index} style={styles.logEntry}>{log}</Text>
            ))
          )}
        </ScrollView>
      </View>

      <View style={{ height: 12 }} />
      <Button title="Назад" onPress={() => navigate('main')} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 22,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  controlsSection: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  counterSection: {
    marginBottom: 15,
  },
  inputSection: {
    marginBottom: 10,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 8,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  inputText: {
    fontSize: 14,
  },
  logsSection: {
    flex: 1,
    marginBottom: 10,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logsContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  logEntry: {
    fontSize: 12,
    marginBottom: 8,
    padding: 6,
    backgroundColor: '#fff',
    borderRadius: 3,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
    paddingLeft: 10,
  },
  noLogs: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
})

export default UseStateEffect
