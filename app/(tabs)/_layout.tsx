import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { BottomNav } from '../../src/components/ui/BottomNav';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          // Hide the default tab bar completely
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="transfer" />
        <Tabs.Screen name="history" />
        <Tabs.Screen name="profile" />
      </Tabs>
      
      {/* Custom Bottom Nav with glassmorphism */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
