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
        <Image
          source={
            bottomPosition === '-65%'
              ? require('./../../assets/arrow.png')
              : require('./../../assets/arrow-up.png')
          }
         // Adjust dimensions as needed
        />
      </TouchableOpacity>

  {/* Conditionally render the sunrise and sunset times */}
  {weather?.sunrise && weather?.sunset && (
    <View style={styles.sunrise}>
      <Text style={styles.sunText2}>Sunrise: {weather.sunrise}</Text>
      <Text style={styles.sunText2}>Sunset : {weather.sunset}</Text>
    </View>
  )}
  
  {weather?.sunrise && weather?.sunset && (
 <View style={styles.sunrise2}>
 <Text style={styles.summaryText}>Summary</Text>

 <View style={styles.infoContainer}>
   <View style={styles.infoItem}>
     <Image source={require('./../../assets/arrow.png')} style={styles.icon} />
     <Text style={styles.sunText}>Temperature</Text>
     <Text style={styles.sunText2}>{weather.temperature} °</Text>
     <View style={styles.infoItem1}>
     <Image source={require('./../../assets/arrow.png')} style={styles.icon} />
     <Text style={styles.sunText}>Sunrise</Text>
     <Text style={styles.sunText2}>{weather.sunrise}</Text>
   </View>
   </View>

   <View style={styles.infoItem}>
     <Image source={require('./../../assets/arrow.png')} style={styles.icon} />
     <Text style={styles.sunText}>Wind</Text>
     <Text style={styles.sunText2}>{weather.wind.speed}km/h</Text>
     <View style={styles.infoItem1}>
     <Image source={require('./../../assets/arrow.png')} style={styles.icon} />
     <Text style={styles.sunText}>Sunset</Text>
     <Text style={styles.sunText2}>{weather.sunset}</Text>
   </View>
   </View>

   <View style={styles.infoItem}>
     <Image source={require('./../../assets/arrow.png')} style={styles.icon} />
     <Text style={styles.sunText}>Cloud</Text>
     <Text style={styles.sunText2}>{weather.cloud_cover}%</Text>
     <View style={styles.infoItem1}>
     <Image source={require('./../../assets/arrow.png')} style={styles.icon} />
     <Text style={styles.sunText}>Humidity</Text>
     <Text style={styles.sunText2}>{weather.humidity}°</Text>
   </View>
   </View>
 </View>

 
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
  sunrise2: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Light blue background similar to the image
    borderRadius: 20,            // Rounded corners
    padding: 20,                 // Padding inside the container
    margin: 10,                  // Margin around the container
    width: '90%',                // Width to make it more centered
    alignSelf: 'center',         // Center align the container
  },
  summaryText: {
    fontSize: 18,                // Larger font size for the summary title
    fontWeight: 'bold',          // Bold text
    color: '#FFFFFF',            // White color text
  },
  infoContainer: {
    flexDirection: 'row',        // Arrange the items in a row
    justifyContent: 'space-between', // Space between items
    marginTop: 20,               // Margin at the top to separate rows
  },
  infoItem: {
    alignItems: 'center',        // Center align the items vertically
  },
  infoItem1: {
    alignItems: 'center', 
    marginTop:30       // Center align the items vertically
  },
  icon: {
    width: 24,                   // Width of the icons
    height: 24,                  // Height of the icons
    marginBottom: 5,             // Space between icon and text
  },
  sunText: {
    fontSize: 16,                // Smaller font for labels
    color: '#FFFFFF', 
   
  },
  sunText2: {
    fontSize: 18,                // Smaller font for labels
    color: '#FFFFFF', 
    fontWeight:'bold'
   
  },
  bottomContainer: {
    width: '100%',
    height: 800,
    marginTop: 'auto',
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Transparent white with 30% opacity
     borderTopLeftRadius:100,
    borderTopRightRadius:100,
    position: 'absolute',
    bottom: '-65%', // Half of the container height to pull it down
    alignItems: 'center',
  },
  btn: {
    width: 70,
    height: 70,
    backgroundColor: '#123597',
    position: 'absolute',
    left: '50%',
    top: -20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 35, // Half of the width/height
    zIndex: 1,
    transform: [{ translateX: -35 }], // Center horizontally
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

});

