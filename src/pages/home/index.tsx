import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FeatureCard from '../../components/featureCard';

const { width } = Dimensions.get('window');
// 获取状态栏高度，用于增加顶部间距
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 40 : StatusBar.currentHeight || 0;

// 功能卡片数据
const featureCards = [
  {
    id: '1',
    title: '天气预报',
    description: '查看实时天气和预报',
    icon: 'weather-partly-cloudy',
    iconType: 'MaterialCommunityIcons',
    colors: ['#4DA0B0', '#D39D38'],
    screen: 'Weather'
  },
  {
    id: '2',
    title: 'Todo',
    description: '记录待办事项',
    icon: 'clipboard-list-outline',
    iconType: 'MaterialCommunityIcons',
    colors: ['#11998e', '#38ef7d'],
    screen: 'Todo'
  },
  {
    id: '3',
    title: '日历',
    description: '查看日程和安排',
    icon: 'calendar',
    iconType: 'Feather',
    colors: ['#834d9b', '#d04ed6'],
    screen: 'Calendar'
  },
  {
    id: '4',
    title: '新闻',
    description: '浏览最新新闻',
    icon: 'newspaper',
    iconType: 'Ionicons',
    colors: ['#2193b0', '#6dd5ed'],
    screen: 'News'
  },
  {
    id: '5',
    title: '设置',
    description: '应用设置和偏好',
    icon: 'settings',
    iconType: 'Feather',
    colors: ['#373B44', '#4286f4'],
    screen: 'Settings'
  },
  {
    id: '6',
    title: '关于',
    description: '关于应用的信息',
    icon: 'info',
    iconType: 'Feather',
    colors: ['#0F2027', '#2C5364'],
    screen: 'About'
  }
];

const HomeScreen = ({ navigation }) => {
  // 渲染功能卡片
  const renderFeatureCard = ({ item }) => (
    <FeatureCard
      title={item.title}
      description={item.description}
      icon={item.icon}
      iconType={item.iconType}
      colors={item.colors}
      onPress={() => navigation.navigate(item.screen)}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>功能中心</Text>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle-outline" size={32} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={featureCards}
        renderItem={renderFeatureCard}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.cardGrid}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    // 增加顶部安全区域高度
    paddingTop: STATUSBAR_HEIGHT,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    // 增加顶部间距
    paddingTop: 24,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    padding: 4,
  },
  cardGrid: {
    padding: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});

export default HomeScreen;