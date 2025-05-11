import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  StatusBar,
  Modal,
  ScrollView,
  Dimensions,
  TextInput
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

// API Key
const API_KEY = 'ahjddlbsm8dv5sbu';

// Weather icon mapping based on numtq codes
const getWeatherIcon = (numtq) => {
  const iconMap = {
    '00': 'weather-sunny',
    '01': 'weather-partly-cloudy',
    '02': 'weather-cloudy',
    '03': 'weather-cloudy',
    '04': 'weather-cloudy',
    '05': 'weather-cloudy',
    '06': 'weather-cloudy',
    '07': 'weather-rainy',
    '08': 'weather-pouring',
    '09': 'weather-pouring',
    '10': 'weather-lightning-rainy',
    '11': 'weather-snowy',
    '12': 'weather-snowy-heavy',
    '13': 'weather-fog',
    '14': 'weather-hail',
    '15': 'weather-windy',
    '16': 'weather-tornado',
    '17': 'weather-hurricane',
    '18': 'weather-dust',
    '19': 'weather-fog',
    '20': 'weather-hazy',
    '21': 'weather-hazy',
    '22': 'weather-hazy',
    '23': 'weather-hazy',
    '24': 'weather-hazy',
    '25': 'weather-hazy',
    '26': 'weather-hazy',
    '27': 'weather-hazy',
    '28': 'weather-hazy',
    '29': 'weather-hazy',
    '30': 'weather-hazy',
    '31': 'weather-hazy',
    '53': 'weather-hazy',
  };

  return iconMap[numtq] || 'weather-cloudy';
};

// Get background gradient based on weather and time
const getBackgroundGradient = (numtq, isDay) => {
  // Sunny day
  if (numtq === '00' && isDay) {
    return ['#4DA0B0', '#D39D38'];
  }
  // Cloudy day
  else if (['01', '02', '03', '04', '05', '06'].includes(numtq) && isDay) {
    return ['#757F9A', '#D7DDE8'];
  }
  // Rainy day
  else if (['07', '08', '09', '10'].includes(numtq)) {
    return ['#616161', '#9BC5C3'];
  }
  // Snowy day
  else if (['11', '12'].includes(numtq)) {
    return ['#8e9eab', '#eef2f3'];
  }
  // Night
  else if (!isDay) {
    return ['#232526', '#414345'];
  }
  // Default
  else {
    return ['#2980B9', '#6DD5FA'];
  }
};

const WeatherScreen = ({ navigation }) => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState({ city_id: 'CH010100', name: '北京' });
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);
  // 搜索相关状态
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);

  // Determine if it's daytime (between 6am and 6pm)
  const isDay = () => {
    const hours = new Date().getHours();
    return hours >= 6 && hours < 18;
  };

  // Flatten city list for dropdown
  const flattenCities = (cityData) => {
    let flatList = [];

    if (!cityData || !cityData.length) return flatList;

    cityData.forEach(province => {
      if (province.list && province.list.length) {
        province.list.forEach(city => {
          if (city.list && city.list.length) {
            city.list.forEach(district => {
              flatList.push(district);
            });
          }
        });
      }
    });

    return flatList;
  };

  // 处理城市搜索
  const handleCitySearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredCities(cities);
    } else {
      const filtered = cities.filter(city =>
        city.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  };

  // 重置搜索
  const resetSearch = () => {
    setSearchQuery('');
    setFilteredCities(cities);
  };

  // 打开模态框时重置搜索
  const openCityModal = () => {
    resetSearch();
    setModalVisible(true);
  };

  // Fetch city list
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('http://api.yytianqi.com/citylist/id/1');
        const data = await response.json();

        if (data && data.list) {
          const flattenedCities = flattenCities(data.list);
          setCities(flattenedCities);
          setFilteredCities(flattenedCities); // 初始化过滤后的城市列表
        }
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError('无法获取城市列表，请检查网络连接');
      }
    };

    fetchCities();
  }, []);

  // Fetch weather data when selected city changes
  useEffect(() => {
    if (selectedCity) {
      fetchWeatherData(selectedCity.city_id);
    }
  }, [selectedCity]);

  // Fetch weather data from API
  const fetchWeatherData = async (cityId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://api.yytianqi.com/forecast7d?city=${cityId}&key=${API_KEY}`);
      const data = await response.json();

      if (data.code === 1) {
        setWeatherData(data.data);
      } else {
        setError(`获取天气数据失败: ${data.msg}`);
      }
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('无法获取天气数据，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // Render city item in dropdown
  const renderCityItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cityItem}
      onPress={() => {
        setSelectedCity(item);
        setModalVisible(false);
      }}
    >
      <Text style={styles.cityName}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Render weather forecast item
  const renderForecastItem = ({ item, index }) => {
    const isToday = index === 0;

    return (
      <View style={styles.forecastItem}>
        <Text style={styles.forecastDay}>
          {isToday ? '今天' : new Date(item.date).toLocaleDateString('zh-CN', { weekday: 'short' })}
        </Text>
        <Text style={styles.forecastDate}>{item.date.substring(5)}</Text>

        <View style={styles.forecastIconContainer}>
          <MaterialCommunityIcons
            name={getWeatherIcon(item.numtq1)}
            size={28}
            color="#fff"
          />
          <Text style={styles.weatherText}>{item.tq1}</Text>
        </View>

        <View style={styles.tempContainer}>
          <Text style={styles.maxTemp}>{item.qw1}°</Text>
          <View style={styles.tempBar} />
          <Text style={styles.minTemp}>{item.qw2}°</Text>
        </View>

        <Text style={styles.windText}>
          {item.fx1} {item.fl1}
        </Text>
      </View>
    );
  };

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {weatherData ? (
        <LinearGradient
          colors={getBackgroundGradient(
            weatherData.list[0].numtq1,
            isDay()
          )}
          style={styles.gradientContainer}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header with back button and city selector */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.citySelector}
                onPress={openCityModal}
              >
                <Text style={styles.cityText}>{selectedCity.name}</Text>
                <Ionicons name="chevron-down" size={20} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => fetchWeatherData(selectedCity.city_id)}
              >
                <Feather name="refresh-cw" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Current weather */}
            {weatherData.list && weatherData.list.length > 0 && (
              <View style={styles.currentWeather}>
                <View style={styles.currentMain}>
                  <MaterialCommunityIcons
                    name={getWeatherIcon(weatherData.list[0].numtq1)}
                    size={80}
                    color="#fff"
                  />
                  <Text style={styles.currentTemp}>{weatherData.list[0].qw1}°</Text>
                </View>

                <Text style={styles.weatherCondition}>
                  {weatherData.list[0].tq1}
                </Text>

                <View style={styles.currentDetails}>
                  <View style={styles.detailItem}>
                    <Feather name="thermometer" size={16} color="#fff" />
                    <Text style={styles.detailText}>
                      {weatherData.list[0].qw2}° / {weatherData.list[0].qw1}°
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Feather name="wind" size={16} color="#fff" />
                    <Text style={styles.detailText}>
                      {weatherData.list[0].fx1} {weatherData.list[0].fl1}
                    </Text>
                  </View>
                </View>

                <Text style={styles.updateTime}>
                  更新时间: {weatherData.sj.substring(0, 16)}
                </Text>
              </View>
            )}

            {/* Weather forecast */}
            <View style={styles.forecastContainer}>
              <Text style={styles.forecastTitle}>未来天气预报</Text>
              <FlatList
                data={weatherData.list}
                renderItem={renderForecastItem}
                keyExtractor={(item) => item.date}
                horizontal={false}
                scrollEnabled={false}
              />
            </View>
          </ScrollView>

          {/* City selection modal with search */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>选择城市</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                {/* 搜索框 */}
                <View style={styles.searchContainer}>
                  <View style={styles.searchInputContainer}>
                    <Feather name="search" size={18} color="#999" style={styles.searchIcon} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="搜索城市..."
                      placeholderTextColor="#999"
                      value={searchQuery}
                      onChangeText={handleCitySearch}
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={resetSearch} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={18} color="#999" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* 城市列表 */}
                {filteredCities.length > 0 ? (
                  <FlatList
                    data={filteredCities}
                    renderItem={renderCityItem}
                    keyExtractor={(item) => item.city_id}
                    style={styles.cityList}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>没有找到匹配的城市</Text>
                      </View>
                    }
                  />
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>没有找到匹配的城市</Text>
                  </View>
                )}

                {/* 搜索结果统计 */}
                {filteredCities.length > 0 && (
                  <View style={styles.resultCountContainer}>
                    <Text style={styles.resultCountText}>
                      找到 {filteredCities.length} 个城市
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Modal>
        </LinearGradient>
      ) : (
        <View style={styles.loadingContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#0080ff" />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={50} color="#ff6b6b" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => fetchWeatherData(selectedCity.city_id)}
              >
                <Text style={styles.retryText}>重试</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gradientContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
  },
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 5,
  },
  refreshButton: {
    padding: 8,
  },
  currentWeather: {
    alignItems: 'center',
    marginBottom: 40,
  },
  currentMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentTemp: {
    fontSize: 80,
    fontWeight: '200',
    color: '#fff',
  },
  weatherCondition: {
    fontSize: 24,
    color: '#fff',
    marginTop: 10,
  },
  currentDetails: {
    flexDirection: 'row',
    marginTop: 20,
    width: '80%',
    justifyContent: 'space-around',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
  updateTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 20,
  },
  forecastContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  forecastDay: {
    width: 40,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  forecastDate: {
    width: 50,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  forecastIconContainer: {
    width: 70,
    alignItems: 'center',
  },
  weatherText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
  },
  maxTemp: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tempBar: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    flex: 1,
    marginHorizontal: 5,
  },
  minTemp: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  windText: {
    width: 80,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  // 搜索相关样式
  searchContainer: {
    marginBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  cityList: {
    flex: 1,
  },
  cityItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cityName: {
    fontSize: 16,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  resultCountContainer: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  resultCountText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0080ff',
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default WeatherScreen;