import { StyleSheet, Text, View, Dimensions } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient'; // Correct import

const { width, height } = Dimensions.get('window');

export default function Home() {
  return (
    <LinearGradient
      colors={['#97ABFF', '#123597']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.text}>Home</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    color: '#fff',
  },
});
