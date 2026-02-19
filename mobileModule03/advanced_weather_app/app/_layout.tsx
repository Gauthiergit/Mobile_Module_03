import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

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

export default function RootLayout() {
	const colorScheme = useColorScheme();
  return (
	<ThemeProvider value={colorScheme === 'dark' ? darkTheme : lightTheme}>
		<Stack>
	        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
		</Stack>
	</ThemeProvider>
  )
}
