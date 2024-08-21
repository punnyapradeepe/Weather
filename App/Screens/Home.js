import { StyleSheet, Text, View, Dimensions, TextInput, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function Home() {
  const [city, setCity] = useState('');
  const [data, setData] = useState(null);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  const handleFetchData = async () => {
    const url = `https://ai-weather-by-meteosource.p.rapidapi.com/find_places?text=${encodeURIComponent(city)}&language=en`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '03d158fe43mshe05f120bb876a55p1ab78ajsna4fe1f643e8a',
        'x-rapidapi-host': 'ai-weather-by-meteosource.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      if (response.ok) {
        const newData = result[0]; // Assuming the first result is what you want
        setData(newData);
        setError(null);
        
        // Store latitude and longitude in AsyncStorage
        await AsyncStorage.setItem('latitude', newData.lat);
        await AsyncStorage.setItem('longitude', newData.lon);

        // Fetch weather data using the new latitude and longitude
        fetchWeatherData(newData.lat, newData.lon);
      } else {
        setError(result.message || 'Error fetching data');
        setData(null);
      }
    } catch (error) {
      setError('An error occurred: ' + error.message);
      setData(null);
    }
  };

  const fetchWeatherData = async (lat, lon) => {
    const url = `https://ai-weather-by-meteosource.p.rapidapi.com/current?lat=${lat}&lon=${lon}&timezone=auto&language=en&units=auto`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '03d158fe43mshe05f120bb876a55p1ab78ajsna4fe1f643e8a',
        'x-rapidapi-host': 'ai-weather-by-meteosource.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      if (response.ok) {
        setWeather(result.current);
        setError(null);
      } else {
        setError(result.message || 'Error fetching weather data');
        setWeather(null);
      }
    } catch (error) {
      setError('An error occurred: ' + error.message);
      setWeather(null);
    }
  };

  return (
    <LinearGradient
      colors={['#97ABFF', '#123597']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter city name"
            value={city}
            onChangeText={setCity}
          />
          <TouchableOpacity style={styles.button} onPress={handleFetchData}>
            <Text style={styles.buttonText}>Go</Text>
          </TouchableOpacity>
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
        {data && (
          <View style={styles.infoContainer}>
            <Text style={styles.cityText}>{data.name}</Text>
            {/* <Text style={styles.text}>{data.country}</Text> */}
            <Text style={{color:'white',alignSelf:'center'}}>Current Location</Text>
          </View>
        )}
        {weather && (
          <View style={styles.weatherContainer}>
            <View style={styles.weatherInfo}>
              <Image 
                source={weather.summary.toLowerCase() === 'overcast' ? require('./../../assets/cloudy.png') : 
                         weather.summary.toLowerCase() === 'partly clear' ? require('./../../assets/sun.png') : 
                         weather.summary.toLowerCase() === 'rain' ? require('./../../assets/rain.png') : 

                         null}
                style={styles.image}
              />
              <View style={styles.weatherDetails}>
                <Text style={styles.temperatureText}>{weather.temperature}° </Text>
             
              </View>
       

            </View>
            <Text style={styles.summaryText}>{weather.summary} - H:{weather.humidity}%  L: {weather.feels_like}°</Text>

            {/* <Text style={styles.text}>Feels Like: {weather.feels_like}°</Text>
            <Text style={styles.text}>Wind Speed: {weather.wind.speed} km/h</Text>
            <Text style={styles.text}>Precipitation: {weather.precipitation.total} mm</Text>
            <Text style={styles.text}>Humidity: {weather.humidity}%</Text> */}
          </View>
        )}
      </View>
      
      <View style={styles.bottomContainer}>
      <View style={styles.btn}>
        <Image source={require('./../../assets/Vector (11).png')}/>
      </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: width,
      height: height,
    },
    content: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      padding: 20,
    },
    inputContainer: {
      flexDirection: 'row',
      width: '100%',
      paddingTop: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      width: '80%',
      marginRight: 10,
      paddingHorizontal: 10,
      borderRadius: 5,
    },
    button: {
      backgroundColor: '#123597',
      padding: 10,
      borderRadius: 5,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
    },
    error: {
      color: 'red',
      marginTop: 10,
    },
    infoContainer: {
      marginTop: 20,
      alignItems: 'flex-start', // Align items to the left
      width: '100%', // Ensure the container takes the full width
    },
    cityText: {
      fontSize: 50,
      fontWeight: 'bold',
      color: '#fff',
      alignSelf:'center'
    },
    weatherContainer: {
      marginTop: 20,
    },
    weatherInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    weatherDetails: {
      marginLeft: 30,
    },
    image: {
      width: 100,
      height: 100,
      resizeMode: 'contain',
    },
    temperatureText: {
      fontSize: 50,
      color: '#fff',
      marginBottom: 5,
      fontWeight: 'bold',
    },
    summaryText: {
      fontSize: 18,
      color: '#fff',
      marginLeft: 50,
      margintop:20
    },
    text: {
      fontSize: 18,
      color: '#fff',
      marginBottom: 20,
      marginLeft: 123, // Add left margin
    
    },
    text1: {
        fontSize: 18,
        color: '#fff',
        marginTop: 20,
        marginLeft: 10, // Add left margin
      
      },
    bottomContainer: {
      width: '100%',
      height: '35%',
      marginTop: 'auto',
      backgroundColor: 'rgba(255, 255, 255, 0.3)', // Transparent white with 30% opacity
      borderRadius: 200,
      position: 'absolute',
      bottom: -160,
      zIndex: 0,
    },
    btn: {
      width: 70,
      height: 70,
      backgroundColor: '#123597',
      position: 'absolute',
      top: -20,
      left: 145,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 90,
      zIndex: 1,
    },
  });
  

  
