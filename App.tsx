import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import HomeScreen from './src/pages/home/index';
import WeatherScreen from './src/pages/weather/index';
import TodoListScreen from './src/pages/todo/index';
import TodoEditScreen from './src/pages/todo/edit';

// 简单的导航上下文
export const NavigationContext = React.createContext();

const App = () => {
  // 当前屏幕状态
  const [currentScreen, setCurrentScreen] = useState('Home');
  // 屏幕参数
  const [screenParams, setScreenParams] = useState({});

  // 简单的导航函数
  const navigation = {
    navigate: (screenName, params = {}) => {
      setCurrentScreen(screenName);
      setScreenParams(params);
    },
    goBack: () => {
      // 如果是从编辑页面返回，则返回到Todo列表页面
      if (currentScreen === 'TodoEdit') {
        setCurrentScreen('Todo');
        setScreenParams({});
      } else {
        // 其他情况返回首页
        setCurrentScreen('Home');
        setScreenParams({});
      }
    },
    params: screenParams,
    addListener: (event, callback) => {
      // 简单实现focus事件监听
      if (event === 'focus') {
        // 当屏幕变为当前屏幕时触发callback
        callback();
      }
      // 返回一个清理函数
      return () => {};
    }
  };

  // 根据当前屏幕渲染对应组件
  const renderScreen = () => {
    switch (currentScreen) {
      case 'Weather':
        return <WeatherScreen navigation={navigation} />;
      case 'Todo':
        return <TodoListScreen navigation={navigation} />;
      case 'TodoEdit':
        return <TodoEditScreen navigation={navigation} route={{ params: screenParams }} />;
      case 'Home':
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  return (
    <NavigationContext.Provider value={navigation}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={currentScreen === 'Home' ? 'dark-content' : 'light-content'} />
        {renderScreen()}
      </SafeAreaView>
    </NavigationContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;