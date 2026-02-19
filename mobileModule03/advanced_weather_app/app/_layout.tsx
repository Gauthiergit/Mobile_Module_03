import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { useFonts } from 'expo-font';
import { useEffect } from "react";
import * as SplashScreen from 'expo-splash-screen';

const lightTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		background: 'transparent',
	},
};

const darkTheme = {
	...DarkTheme,
	colors: {
		...DarkTheme.colors,
		background: 'transparent',
	},
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded, error] = useFonts({
	    'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
	    'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf')
	});

	useEffect(() => {
		if (loaded || error) {
		SplashScreen.hideAsync();
		}
	}, [loaded, error]);

	if (!loaded && !error) {
		return null;
	}
	return (
		<ThemeProvider value={colorScheme === 'dark' ? darkTheme : lightTheme}>
			<Stack>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			</Stack>
		</ThemeProvider>
	)
}
