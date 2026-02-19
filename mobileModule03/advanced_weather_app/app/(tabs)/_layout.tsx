import { Colors } from '@/constants/theme';
import React from 'react';
import { ImageBackground, useColorScheme } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { Header } from '@/components/Header';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { SearchlocationProvider } from '@/providers/SearchLocationProvider';

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);
const DARKBACKGROUND = require("../../assets/images/background_image_dark_mode.jpg");
const LIGHTBACKGROUND = require("../../assets/images/background_image_light_mode.jpg");

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const backgroundImage = colorScheme == "dark" ? DARKBACKGROUND : LIGHTBACKGROUND
	const tintColor = Colors[colorScheme ?? "light"].tintColor;

	return (
		<SearchlocationProvider>
			<ImageBackground 
				source={backgroundImage}
				style={{ flex: 1 }}
			>
				<Header />
				<MaterialTopTabs
					style={{ flex: 1 }}
					tabBarPosition="bottom"
					screenOptions={{
						tabBarActiveTintColor: tintColor,
						tabBarInactiveTintColor: Colors[colorScheme ?? "light"].secondaryText,
						tabBarLabelStyle: { fontSize: 20, textTransform: 'none' },
						tabBarIndicatorStyle: { backgroundColor: tintColor, height: 2, top: 0 },
						tabBarStyle: { backgroundColor: 'transparent' },
						swipeEnabled: true,
						lazy: true,
						lazyPreloadDistance: 1,
					}}>
					<MaterialTopTabs.Screen
						name="index"
						options={{
							title: 'Currently',
							tabBarIcon: ({ color }: { color: string }) => <MaterialCommunityIcons name="weather-sunset" size={30} color={color} />,
						}}
					/>
					<MaterialTopTabs.Screen
						name="today"
						options={{
							title: 'Today',
							tabBarIcon: ({ color }: { color: string }) => <FontAwesome5 name="calendar-day" size={30} color={color} />,
						}}
					/>
					<MaterialTopTabs.Screen
						name="weekly"
						options={{
							title: 'Weekly',
							tabBarIcon: ({ color }: { color: string }) => <FontAwesome5 name="calendar-week" size={30} color={color} />,
						}}
					/>
				</MaterialTopTabs>
			</ImageBackground>
		</SearchlocationProvider>
	);
}
