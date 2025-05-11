import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

// 获取状态栏高度，用于增加顶部间距
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 40 : StatusBar.currentHeight || 0;

// Todo项目类型定义
export interface TodoItem {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const TodoListScreen = ({ navigation }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 从AsyncStorage加载Todo列表
  const loadTodos = async () => {
    try {
      setLoading(true);
      const storedTodos = await AsyncStorage.getItem('todos');
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      }
    } catch (error) {
      console.error('加载Todo失败:', error);
      Alert.alert('错误', '加载Todo列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadTodos();
  }, []);

  // 监听页面聚焦事件，从编辑页面返回时重新加载数据
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTodos();
    });

    return unsubscribe;
  }, [navigation]);

  // 删除Todo项
  const deleteTodo = async (id: string) => {
    try {
      const updatedTodos = todos.filter(todo => todo.id !== id);
      setTodos(updatedTodos);
      await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
    } catch (error) {
      console.error('删除Todo失败:', error);
      Alert.alert('错误', '删除Todo失败');
    }
  };

  // 确认删除
  const confirmDelete = (id: string) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个Todo吗？',
      [
        { text: '取消', style: 'cancel' },
        { text: '删除', onPress: () => deleteTodo(id), style: 'destructive' }
      ]
    );
  };

  // 渲染Todo项
  const renderTodoItem = ({ item }: { item: TodoItem }) => {
    const updatedDate = new Date(item.updatedAt);
    const formattedDate = `${updatedDate.getFullYear()}-${String(updatedDate.getMonth() + 1).padStart(2, '0')}-${String(updatedDate.getDate()).padStart(2, '0')} ${String(updatedDate.getHours()).padStart(2, '0')}:${String(updatedDate.getMinutes()).padStart(2, '0')}`;

    return (
      <TouchableOpacity
        style={styles.todoItem}
        onPress={() => navigation.navigate('TodoEdit', { todo: item })}
      >
        <View style={styles.todoContent}>
          <Text style={styles.todoText} numberOfLines={2}>{item.content}</Text>
          <Text style={styles.todoDate}>更新于: {formattedDate}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDelete(item.id)}
        >
          <Feather name="trash-2" size={20} color="#ff6b6b" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // 渲染空列表提示
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Feather name="clipboard" size={64} color="#ccc" />
      <Text style={styles.emptyText}>暂无Todo项</Text>
      <Text style={styles.emptySubText}>点击右上角的"+"按钮添加新的Todo</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Todo列表</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('TodoEdit', { todo: null })}
        >
          <Ionicons name="add" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Todo列表 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0080ff" />
        </View>
      ) : (
        <FlatList
          data={todos}
          renderItem={renderTodoItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: STATUSBAR_HEIGHT,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 24,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  todoItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  todoContent: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  todoDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TodoListScreen;