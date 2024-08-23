import { StyleSheet, Text, View, Dimensions, TextInput, TouchableOpacity, Image, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';

const { width, height } = Dimensions.get('window');

export default function Home() {
  const [city, setCity] = useState('Aluva');  // Initial city set to 'Aluva'
  const [data, setData] = useState(null);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [bottomPosition, setBottomPosition] = useState('-80%');

  useEffect(() => {
    handleFetchData();  // Automatically fetch data for Aluva when the component mounts
  }, []);

  const handleButtonPress = () => {
    setBottomPosition(bottomPosition === '-80%' ? '-35%' : '-80%');
  };

  const handleFetchData = async () => {
    const url = `https://ai-weather-by-meteosource.p.rapidapi.com/find_places?text=${encodeURIComponent(city)}&language=en`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '6c384e0cf9msh7e0fc4d27211a7cp16c71ejsn0fe2e39ae385',
        'x-rapidapi-host': 'ai-weather-by-meteosource.p.rapidapi.com',
      },
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      if (response.ok) {
        const newData = result[0];
        setData(newData);
        setError(null);

        await AsyncStorage.setItem('latitude', newData.lat);
        await AsyncStorage.setItem('longitude', newData.lon);

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
        'x-rapidapi-host': 'ai-weather-by-meteosource.p.rapidapi.com',
      },
    };

    try {
      const weatherResponse = await fetch(weatherUrl, options);
      const weatherResult = await weatherResponse.json();
      if (!weatherResponse.ok) {
        throw new Error(weatherResult.message || 'Error fetching weather data');
      }

      const astroResponse = await fetch(astroUrl, options);
      const astroResult = await astroResponse.json();
      if (!astroResponse.ok) {
        throw new Error(astroResult.message || 'Error fetching astronomical data');
      }

      const sunData = astroResult.astro.data[0].sun;
      const moonData = astroResult.astro.data[0].moon;

      if (sunData?.rise && sunData?.set && moonData?.phase) {
        const sunrise = new Date(sunData.rise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        const sunset = new Date(sunData.set).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

        setWeather({
          ...weatherResult.current,
          sunrise,
          sunset,
          moonPhase: moonData.phase,
        });
        setError(null);
      } else {
        throw new Error('Sun or Moon data is unavailable');
      }
    } catch (error) {
      console.error('Error occurred:', error.message);
      setError('An error occurred: ' + error.message);
      setWeather(null);
    }
  };


  async function fetchHourlyWeather() {
    try {
      // Retrieve latitude and longitude from AsyncStorage
      const latitude = await AsyncStorage.getItem('latitude');
      const longitude = await AsyncStorage.getItem('longitude');
  
      // Construct the API URL using the retrieved latitude and longitude
      const url = `https://ai-weather-by-meteosource.p.rapidapi.com/hourly?lat=${latitude}&lon=${longitude}&timezone=auto&language=en&units=auto`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '6c384e0cf9msh7e0fc4d27211a7cp16c71ejsn0fe2e39ae385',
          'x-rapidapi-host': 'ai-weather-by-meteosource.p.rapidapi.com',
        },
      };
  
      const response = await fetch(url, options);
      const result = await response.json();
  
      // Check if the result contains hourly data
      if (result.hourly && result.hourly.data) {
        const hourlyData = result.hourly.data;
  
        // Filter the data to get time and temperature between 12:00 AM to 12:00 PM
        const filteredData = hourlyData.filter((item) => {
          const date = new Date(item.date);
          const hours = date.getHours();
          return hours >= 0 && hours <= 12; // 12:00 AM to 12:00 PM
        });
  
        // Extract time and temperature
        const timeAndTemperature = filteredData.map((item) => {
          return {
            time: new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            temperature: item.temperature,
          };
        });
  
        console.log(timeAndTemperature); // Log the time and temperature data
      } else {
        console.error('No hourly data found');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error.message);
    }
  }

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
        {data && bottomPosition === '-80%' && (
          <View style={styles.infoContainer}>
            <View style={{alignSelf:'center'}}>
            <Text style={styles.cityText}>{data.name}</Text>
            <View style={{flexDirection:'row'}}>
            <Entypo name="location-pin" size={24} color="white" />
            <Text style={{color:'white',alignSelf:'center'}}>Current Location</Text>
            </View></View>
          </View>
        )}
        {weather && bottomPosition === '-80%' && (
          <View style={styles.weatherContainer}>
            <View style={styles.weatherInfo}>
              <Image 
                source={weather.summary.toLowerCase() === 'overcast' ? require('./../../assets/cloudy.png') : 
                         weather.summary.toLowerCase() === 'partly clear' ? require('./../../assets/sun.png') : 
                         weather.summary.toLowerCase() === 'rain' ? require('./../../assets/rain.png') : 
                         weather.summary.toLowerCase() === 'rain shower' ? require('./../../assets/rain.png') : 
                         weather.summary.toLowerCase() === 'light rain' ? require('./../../assets/rain.png') : 
                         weather.summary.toLowerCase() === 'cloudy' ? require('./../../assets/rain.png') : 
                         weather.summary.toLowerCase() === 'possible rain' ? require('./../../assets/rain.png') : 
                         weather.summary.toLowerCase() === 'clear' ? require('./../../assets/rain.png') : 

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
        {bottomPosition === '-35%' && (
         <View style={styles.infoContainer1}>
          <View style={{alignSelf:'center'}}>
         <Text style={styles.cityText}>{data.name}</Text>
         <View style={{flexDirection:'row'}}>
         <Entypo name="location-pin" size={24} color="white" />
           <Text style={{color:'white'}}>Current Location</Text>
         </View>
         </View>
         <View style={styles.weatherInfo}>
              <Image 
                source={weather.summary.toLowerCase() === 'overcast' ? require('./../../assets/cloudy.png') : 
                         weather.summary.toLowerCase() === 'partly clear' ? require('./../../assets/sun.png') : 
                         weather.summary.toLowerCase() === 'rain' ? require('./../../assets/rain.png') : 
                         weather.summary.toLowerCase() === 'rain shower' ? require('./../../assets/rain.png') : 
                         weather.summary.toLowerCase() === 'cloudy' ? require('./../../assets/rain.png') : 
                         weather.summary.toLowerCase() === 'possible rain' ? require('./../../assets/rain.png') : 
                         weather.summary.toLowerCase() === 'light rain' ? require('./../../assets/rain.png') : 
                         weather.summary.toLowerCase() === 'clear' ? require('./../../assets/rain.png') : 

                       
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
            bottomPosition === '-70%'
              ? require('./../../assets/arrow.png')
              : require('./../../assets/arrow-up.png')
          }
         // Adjust dimensions as needed
        />
      </TouchableOpacity>

  {/* Conditionally render the sunrise and sunset times */}
  {weather?.sunrise && weather?.sunset && (
    <View style={styles.sunrise}>
      <Image source={require('./../../assets/sun-fog.png')}/>
      <View style={{marginLeft:20,marginRight:20}}>      
      <Text style={styles.sunText2}>Sunrise</Text>
      <Text style={styles.sunText2}> {weather.sunrise}</Text>
      </View>
      <View style={{marginLeft:20,marginRight:20}}>
      <Text style={styles.sunText2}>Sunset</Text>
      <Text style={styles.sunText2}>{weather.sunset}</Text>
      </View>
    </View>
  )}
  
  {weather?.sunrise && weather?.sunset && (
 <View style={styles.sunrise2}>
 <Text style={styles.summaryText}>Summary</Text>

 <View style={styles.infoContainer}>
   <View style={styles.infoItem}>
   <FontAwesome5 name="temperature-high" size={30} color="white" />
     <Text style={styles.sunText}>Temperature</Text>
     <Text style={styles.sunText2}>{weather.temperature} °</Text>
     <View style={styles.infoItem1}>
     <Feather name="sunrise" size={30} color="white" />
     <Text style={styles.sunText}>Sunrise</Text>
     <Text style={styles.sunText2}>{weather.sunrise}</Text>
   </View>
   </View>

   <View style={styles.infoItem}>
     <Feather name="wind" size={30} color="white" />
     <Text style={styles.sunText}>Wind</Text>
     <Text style={styles.sunText2}>{weather.wind.speed}km/h</Text>
     <View style={styles.infoItem1}>
     <MaterialCommunityIcons name="weather-sunset" size={30} color="white" />
          <Text style={styles.sunText}>Sunset</Text>
     <Text style={styles.sunText2}>{weather.sunset}</Text>
   </View>
   </View>

   <View style={styles.infoItem}>
<Entypo name="cloud" size={30} color="white" />    
 <Text style={styles.sunText}>Cloud</Text>
     <Text style={styles.sunText2}>{weather.cloud_cover}%</Text>
     <View style={styles.infoItem1}>
     <FontAwesome5 name="moon" size={30} color="white" />
     <Text style={styles.sunText}>Moon</Text>
     <Text style={styles.sunText2}>{weather.moonPhase}°</Text>
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
  
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    paddingVertical:5,
    borderColor: 'gray',
    borderWidth: 1,
    width: '80%',
    marginRight: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#123597',
    paddingVertical:8,
    borderRadius: 5,
    paddingHorizontal: 10,
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
  marginTop:10
  },
  cityText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft:10
  },
  weatherContainer: {
    marginTop: 10,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  
  },
  weatherDetails: {

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
     marginRight:'auto'
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
    marginTop:5,
    marginBottom:5,
 
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
    marginBottom: 10,
    marginTop: 10,
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
    width: 30,                   // Width of the icons
    height: 30,                  // Height of the icons
    marginBottom: 5,  
    borderRadius:20           // Space between icon and text
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
    borderRadius:50
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
    flexDirection:'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal:20,
    paddingVertical:30,
    marginTop:60,
    borderRadius:20

  },

});

