import { StyleSheet, Text, View, Dimensions, TextInput, TouchableOpacity, Image, FlatList } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function Home() {
  const [city, setCity] = useState('');
  const [data, setData] = useState(null);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [bottomPosition, setBottomPosition] = useState('-65%'); // State for bottom position

  const handleButtonPress = () => {
    setBottomPosition(bottomPosition === '-65%'? '-20%' : '-65%');
  };

  const handleFetchData = async () => {
    const url = `https://ai-weather-by-meteosource.p.rapidapi.com/find_places?text=${encodeURIComponent(city)}&language=en`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '6c384e0cf9msh7e0fc4d27211a7cp16c71ejsn0fe2e39ae385',
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
    const weatherUrl = `https://ai-weather-by-meteosource.p.rapidapi.com/current?lat=${lat}&lon=${lon}&timezone=auto&language=en&units=auto`;
    const astroUrl = `https://ai-weather-by-meteosource.p.rapidapi.com/astro?lat=${lat}&lon=${lon}&timezone=auto`;

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '6c384e0cf9msh7e0fc4d27211a7cp16c71ejsn0fe2e39ae385',
            'x-rapidapi-host': 'ai-weather-by-meteosource.p.rapidapi.com'
        }
    };

    try {
        // Fetch weather data
        const weatherResponse = await fetch(weatherUrl, options);
        const weatherResult = await weatherResponse.json();
        if (!weatherResponse.ok) {
            throw new Error(weatherResult.message || 'Error fetching weather data');
        }

        // Fetch astronomical data
        const astroResponse = await fetch(astroUrl, options);
        const astroResult = await astroResponse.json();
        if (!astroResponse.ok) {
            throw new Error(astroResult.message || 'Error fetching astronomical data');
        }

        // Log the full astroResult for debugging
        console.log('Astro Result:', astroResult);

        // Correctly access the sun data
        const sunData = astroResult.astro.data[0].sun;

        // Ensure that rise and set data exists
        if (sunData?.rise && sunData?.set) {
            // Convert and format the sunrise and sunset times
            const sunrise = new Date(sunData.rise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
            const sunset = new Date(sunData.set).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

            // Combine results
            setWeather({
                ...weatherResult.current,
                sunrise,
                sunset
            });
            setError(null);
        } else {
            throw new Error('Sun data is unavailable');
        }
    } catch (error) {
        console.error('Error occurred:', error.message);
        setError('An error occurred: ' + error.message);
        setWeather(null);
    }
};




  // Dummy data for the FlatList
  const flatListData = Array.from({ length: 12 }, (_, i) => ({ id: i.toString(), text: `Item ${i + 1}` }));

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
        {data && bottomPosition === '-65%' && (
          <View style={styles.infoContainer}>
            <Text style={styles.cityText}>{data.name}</Text>
            <View style={{flexDirection:'row',alignSelf:'center'}}>
              <Image source={require('./../../assets/location 1.png')} />
              <Text style={{color:'white',alignSelf:'center'}}>Current Location</Text>
            </View>
          </View>
        )}
        {weather && bottomPosition === '-65%' && (
          <View style={styles.weatherContainer}>
            <View style={styles.weatherInfo}>
              <Image 
                source={weather.summary.toLowerCase() === 'overcast' ? require('./../../assets/cloudy.png') : 
                         weather.summary.toLowerCase() === 'partly clear' ? require('./../../assets/sun.png') : 
                         weather.summary.toLowerCase() === 'rain' ? require('./../../assets/rain.png') : 
                         weather.summary.toLowerCase() === 'rain shower' ? require('./../../assets/rain.png') : 
                         weather.summary.toLowerCase() === 'light rain' ? require('./../../assets/rain.png') : 
                         weather.summary.toLowerCase() === 'cloudy' ? require('./../../assets/rain.png') : 

                         null}
                style={styles.image}
              />
              <View style={styles.weatherDetails}>
                <Text style={styles.temperatureText}>{weather.temperature}° </Text>
              </View>
            </View>
            <Text style={styles.summaryText}>{weather.summary}  -  H:{weather.humidity}%   L:{weather.feels_like}°</Text>
            {/* <Text style={styles.sunText}>Sunrise: {weather.sunrise}</Text>
<Text style={styles.sunText}>Sunset: {weather.sunset}</Text> */}

            <View style={styles.buttonContainer}>
              <View style={styles.buttonView}><Text style={styles.buttonTextCentered}>Daily</Text></View>
              <View style={styles.buttonView}><Text style={styles.buttonTextCentered}>Weekly</Text></View>
            </View>

            {/* FlatList for 12 items */}
            <FlatList
              data={flatListData}
              renderItem={({ item }) => (
                <View style={styles.flatListItem}>
                  <Text style={styles.flatListItemText}>{item.text}</Text>
                </View>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              contentContainerStyle={styles.flatListContainer}
            />
          </View>
        )}
        {bottomPosition === '-20%' && (
         <View style={styles.infoContainer1}>
          <View>
         <Text style={styles.cityText}>{data.name}</Text>
         <View style={{flexDirection:'row',alignSelf:'center'}}>
           <Image source={require('./../../assets/location 1.png')} />
           <Text style={{color:'white',alignSelf:'center'}}>Current Location</Text>
         </View>
         </View>
         <View style={styles.weatherInfo}>
              <Image 
                source={weather.summary.toLowerCase() === 'overcast' ? require('./../../assets/cloudy.png') : 
                         weather.summary.toLowerCase() === 'partly clear' ? require('./../../assets/sun.png') : 
                         weather.summary.toLowerCase() === 'rain' ? require('./../../assets/rain.png') : 
                         weather.summary.toLowerCase() === 'rain shower' ? require('./../../assets/rain.png') : 
                         weather.summary.toLowerCase() === 'cloudy' ? require('./../../assets/rain.png') : 
                         weather.summary.toLowerCase() === 'light rain' ? require('./../../assets/rain.png') : 
                         null}
                style={styles.image1}
              />
              <View style={styles.weatherDetails}>
                <Text style={styles.temperatureText1}>{weather.temperature}° </Text>
              </View>
            </View>
       </View>
        )}
      </View>
      <View style={[styles.bottomContainer, { bottom: bottomPosition }]}>
  <TouchableOpacity style={styles.btn} onPress={handleButtonPress}>
    <Image source={require('./../../assets/Vector (11).png')} />
  </TouchableOpacity>

  {/* Conditionally render the sunrise and sunset times */}
  {weather?.sunrise && weather?.sunset && (
    <View style={styles.sunrise}>
      <Text style={styles.sunText}>Sunrise: {weather.sunrise}</Text>
      <Text style={styles.sunText}>Sunset: {weather.sunset}</Text>
    </View>
  )}
  
  {weather?.sunrise && weather?.sunset && (
  <View style={styles.sunrise2}>
   <Text>Summary</Text>
   <Text style={styles.sunText}>Sunrise: {weather.sunrise}</Text>
   <Text style={styles.sunText}>Sunset: {weather.sunset}</Text>
   <Text style={styles.sunText}>temp{weather.temperature}</Text>
   <Text style={styles.sunText}>feels_like {weather.feels_like}</Text>
   <Text style={styles.sunText}>wind speed{weather.wind.speed}</Text>
   <Text style={styles.sunText}>humidity {weather.humidity}</Text>
   <Text style={styles.sunText}>uv_index {weather.uv_index}</Text>
   <Text style={styles.sunText}>wind speed{weather.wind.speed}</Text>
   <Text style={styles.sunText}>humidity {weather.humidity}</Text>
  </View>
   )}
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
    marginTop: 10,
    alignItems: 'flex-start', 
    width: '100%', 
  },
    infoContainer1: {
  flexDirection:'row',
  marginRight:'auto',
  marginTop:20
  },
  cityText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    alignSelf:'center'
  },
  weatherContainer: {
    marginTop: 10,
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
    marginLeft:20
  },
  image1: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
    marginRight:10,
    marginLeft:20
   
  },
  temperatureText1: {
    fontSize: 30,
    color: '#fff',
    marginBottom: 5,
  },
  temperatureText: {
    fontSize: 90,
    color: '#fff',
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 20,
    color: '#fff',
    alignSelf:'center',
    marginTop:10,
    marginBottom:20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
    alignSelf: 'center',
  },
  buttonView: {
    width: 130,
    height: 40,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextCentered: {
    color: '#fff',
    fontSize: 16,
  },
  bottomContainer: {
    width: '100%',
    height: 800,
    marginTop: 'auto',
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Transparent white with 30% opacity
    borderRadius: 100,
    position: 'absolute',
    bottom: '-65%', // Half of the container height to pull it down
    alignItems: 'center',
  },
  btn: {
    width: 70,
    height: 70,
    backgroundColor: '#123597',
    position: 'absolute',
   marginLeft:'50%',
   top:10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 90,
    zIndex: 1,
  },
  flatListContainer: {
    paddingHorizontal: 10, // Padding around the FlatList items
    borderRadius:30
  },
  flatListItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Transparent white with 30% opacity
    height:140,
    width:90,
    borderRadius: 10,
    marginRight: 10, // Margin between items

  },
  flatListItemText: {
    color: '#fff',
    fontSize: 16,
  },
  sunrise:{
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal:100,
    paddingVertical:40,
    marginTop:90,
    borderRadius:20

  },
  sunrise2:{
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal:150,
    paddingVertical:100,
    marginTop:50,
    borderRadius:20
  }
});

