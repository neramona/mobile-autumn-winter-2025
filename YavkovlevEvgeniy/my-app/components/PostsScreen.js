import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, Button, FlatList, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import api from '../services/api'
import { useAuthStore } from '../hooks/useAuthStore'

const safeText = (val) => {
  if (val == null) return ''
  if (typeof val === 'string' || typeof val === 'number') return String(val)
  if (typeof val === 'object') {
    if (val.title) return safeText(val.title)
    if (val.name) return safeText(val.name)
    if (val.text) return safeText(val.text)
    if (val.content) return safeText(val.content)
    if (val.msg) return safeText(val.msg)
    try { return JSON.stringify(val) } catch (e) { return String(val) }
  }
  return String(val)
}

const authorName = (item) => {
  if (item.user) return safeText(item.user.name || item.user.email || item.user.id)
  if (typeof item.author === 'string') return item.author
  if (item.author && typeof item.author === 'object') return safeText(item.author.name || item.author.email || item.author.id)
  if (item.userId) return safeText(item.userId)
  return '—'
}

const PostItem = ({ item, onEdit, onDelete, isOwner }) => (
  <View style={styles.post}>
    <Text style={styles.postTitle}>{safeText(item.title)}</Text>
    <Text style={styles.postBody}>{safeText(item.body || item.content)}</Text>
    <Text style={styles.postMeta}>Автор: {authorName(item)}</Text>
    <View style={styles.postButtons}>
      {isOwner && <Button title="Редактировать" onPress={() => onEdit(item)} />}
      {isOwner && <View style={{ width: 8 }} />}
      {isOwner && <Button title="Удалить" color="#c00" onPress={() => onDelete(item)} />}
    </View>
  </View>
)

const PostsScreen = ({ navigate }) => {
  const user = useAuthStore((s) => s.user)
  const [postsAll, setPostsAll] = useState([])
  const [postsMy, setPostsMy] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [editing, setEditing] = useState(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const findArray = (obj) => {
    if (!obj) return null
    if (Array.isArray(obj)) return obj
    if (typeof obj !== 'object') return null
    for (const k of Object.keys(obj)) {
      try {
        const v = obj[k]
        if (Array.isArray(v)) return v
        if (v && typeof v === 'object') {
          const found = findArray(v)
          if (found) return found
        }
      } catch (err) {}
    }
    return null
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [resAll, resMy] = await Promise.all([
        api.request('/posts'),
        api.request('/posts/my')
      ])
      console.log('posts load response all', resAll)
      console.log('posts load response my', resMy)

      const arrAll = findArray(resAll) || findArray(resAll && resAll.data) || []
      const arrMy = findArray(resMy) || findArray(resMy && resMy.data) || []
      setPostsAll(Array.isArray(arrAll) ? arrAll : [])
      setPostsMy(Array.isArray(arrMy) ? arrMy : [])
    } catch (e) {
      setError((e && e.message) || String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const startCreate = () => {
    setEditing({})
    setTitle('')
    setBody('')
  }

  const startEdit = (post) => {
    setEditing(post)
    setTitle(post.title || '')
    setBody(post.body || post.content || '')
  }

  const save = async () => {
    try {
      if (!title || String(title).trim().length < 3) return Alert.alert('Ошибка', 'Введите заголовок (минимум 3 символа)')
      if (!body || String(body).trim().length < 10) return Alert.alert('Ошибка', 'Введите текст поста (минимум 10 символов)')
      setError(null)
      setLoading(true)
      const payload = { title, body, content: body, text: body }
      if (editing && editing.id) {
        await api.request(`/posts/${editing.id}`, { method: 'PUT', body: payload })
      } else {
        await api.request('/posts', { method: 'POST', body: payload })
      }
      setTitle('')
      setBody('')
      setEditing(null)
      setError(null)
      await load()
    } catch (e) {
      let msg = (e && e.message) || 'Ошибка при сохранении'
      try {
        const b = e && e.body
        if (b) {
          if (typeof b === 'string') msg = `${e.status || ''} ${b}`.trim()
          else if (b.message) msg = `${e.status || ''} ${b.message}`.trim()
          else if (Array.isArray(b.errors)) {
            const parts = b.errors.map(it => {
              if (it && it.property && it.constraints) return `${it.property}: ${Object.values(it.constraints).join('; ')}`
              if (it && it.msg) return String(it.msg)
              return JSON.stringify(it)
            })
            msg = `${e.status || ''} ${parts.join('\n')}`.trim()
          } else if (b.errors && typeof b.errors === 'object') {
            const parts = []
            for (const k of Object.keys(b.errors)) {
              const val = b.errors[k]
              if (Array.isArray(val)) parts.push(`${k}: ${val.join('; ')}`)
              else parts.push(`${k}: ${String(val)}`)
            }
            msg = `${e.status || ''} ${parts.join('\n')}`.trim()
          } else msg = `${e.status || ''} ${JSON.stringify(b)}`.trim()
        }
      } catch (err) {}
      setError(msg)
      Alert.alert('Ошибка', msg)
    } finally {
      setLoading(false)
    }
  }

  const remove = async (post) => {
    Alert.alert('Подтвердите', 'Удалить пост?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => {
        try {
          setLoading(true)
          await api.request(`/posts/${post.id}`, { method: 'DELETE' })
          await load()
        } catch (e) {
          Alert.alert('Ошибка', (e && e.message) || 'Ошибка при удалении')
        } finally {
          setLoading(false)
        }
      } }
    ])
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Посты</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button title="Создать" onPress={startCreate} />
        <View style={{ width: 8 }} />
        <Button title="Назад" onPress={() => navigate('main')} />
      </View>

      {(editing !== null) && (
        <View style={styles.editor}>
          <TextInput placeholder="Заголовок" value={title} onChangeText={setTitle} style={styles.input} />
          <TextInput placeholder="Текст" value={body} onChangeText={setBody} style={[styles.input, { height: 100 }]} multiline />
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <Button title="Сохранить" onPress={save} />
            <View style={{ width: 8 }} />
            <Button title="Отмена" color="#666" onPress={() => { setEditing(null); setTitle(''); setBody('') }} />
          </View>
        </View>
      )}

      {loading && <ActivityIndicator size="small" />}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={{ fontWeight: 'bold', marginTop: 6, marginBottom: 6 }}>Мои посты</Text>
      <FlatList
        data={postsMy}
        keyExtractor={(i) => String(i.id || i._id || (i.createTime || Math.random()))}
        renderItem={({ item }) => (
          <PostItem
            item={item}
            onEdit={startEdit}
            onDelete={remove}
            isOwner={true}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />

      <Text style={{ fontWeight: 'bold', marginTop: 12, marginBottom: 6 }}>Все посты</Text>
      <FlatList
        data={postsAll}
        keyExtractor={(i) => String(i.id || i._id || (i.createTime || Math.random()))}
        renderItem={({ item }) => (
          <PostItem
            item={item}
            onEdit={startEdit}
            onDelete={remove}
            isOwner={String(item.user?.id || item.userId || item.authorId || item.user?._id) === String(user?.id || user?.userId || user?._id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, marginBottom: 10, textAlign: 'center' },
  post: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 6 },
  postTitle: { fontWeight: 'bold', marginBottom: 6 },
  postBody: { marginBottom: 8 },
  postMeta: { color: '#666', fontSize: 12, marginBottom: 8 },
  postButtons: { flexDirection: 'row' },
  editor: { marginBottom: 12, borderWidth: 1, borderColor: '#eee', padding: 10, borderRadius: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4, marginBottom: 8 },
  error: { color: 'red', textAlign: 'center', marginBottom: 8 },
})

export default PostsScreen
