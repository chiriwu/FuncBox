import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TodoItem } from './index';

// 获取状态栏高度，用于增加顶部间距
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 40 : StatusBar.currentHeight || 0;

const TodoEditScreen = ({ navigation, route }) => {
  // 获取传递的todo项，如果是新建则为null
  const initialTodo = route.params?.todo || null;

  const [content, setContent] = useState(initialTodo ? initialTodo.content : '');
  const [initialContent, setInitialContent] = useState(initialTodo ? initialTodo.content : '');
  const [hasChanges, setHasChanges] = useState(false);

  // 检测内容变化
  useEffect(() => {
    setHasChanges(content !== initialContent);
  }, [content, initialContent]);

  // 处理Android返回按钮
  useEffect(() => {
    const backAction = () => {
      if (hasChanges) {
        confirmDiscard();
        return true; // 阻止默认返回行为
      }
      return false; // 允许默认返回行为
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [hasChanges]);

  // 保存Todo
  const saveTodo = async () => {
    if (!content.trim()) {
      Alert.alert('提示', '内容不能为空');
      return;
    }

    try {
      // 获取现有的todos
      const storedTodos = await AsyncStorage.getItem('todos');
      let todos: TodoItem[] = storedTodos ? JSON.parse(storedTodos) : [];

      const now = new Date().toISOString();

      if (initialTodo) {
        // 更新现有todo
        todos = todos.map(todo =>
          todo.id === initialTodo.id
            ? { ...todo, content, updatedAt: now }
            : todo
        );
      } else {
        // 创建新todo
        const newTodo: TodoItem = {
          id: Date.now().toString(),
          content,
          createdAt: now,
          updatedAt: now
        };
        todos.unshift(newTodo); // 添加到列表开头
      }

      // 保存到AsyncStorage
      await AsyncStorage.setItem('todos', JSON.stringify(todos));

      // 返回上一页
      navigation.goBack();
    } catch (error) {
      console.error('保存Todo失败:', error);
      Alert.alert('错误', '保存失败，请重试');
    }
  };

  // 确认放弃更改
  const confirmDiscard = () => {
    Alert.alert(
      '放弃更改',
      '你有未保存的更改，确定要放弃吗？',
      [
        { text: '取消', style: 'cancel' },
        { text: '放弃', onPress: () => navigation.goBack() }
      ]
    );
  };

  // 处理返回按钮点击
  const handleBackPress = () => {
    if (hasChanges) {
      confirmDiscard();
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {initialTodo ? '编辑Todo' : '新建Todo'}
        </Text>
        <TouchableOpacity
          style={[styles.doneButton, !hasChanges && styles.disabledButton]}
          onPress={saveTodo}
          disabled={!hasChanges}
        >
          <Text style={[styles.doneText, !hasChanges && styles.disabledText]}>完成</Text>
        </TouchableOpacity>
      </View>

      {/* 编辑区域 */}
      <ScrollView style={styles.contentContainer}>
        <TextInput
          style={styles.input}
          value={content}
          onChangeText={setContent}
          placeholder="输入Todo内容..."
          placeholderTextColor="#999"
          multiline
          autoFocus
          textAlignVertical="top"
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
  doneButton: {
    padding: 8,
  },
  doneText: {
    fontSize: 16,
    color: '#0080ff',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#999',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  input: {
    fontSize: 16,
    color: '#333',
    minHeight: 200,
    textAlignVertical: 'top',
    padding: 0,
  },
});

export default TodoEditScreen;