import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Home from './App/Screens/Home';

export default function App() {
  return (
    <View style={styles.container}>
    <Home/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
});
