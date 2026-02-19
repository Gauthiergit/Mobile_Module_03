import { ThemedText } from '@/components/ThemedText';
import { Colors, errorTextColor } from '@/constants/theme';
import { WEATHER_URL } from '@/constants/url';
import { getWeatherDescription, getWeatherIcon } from '@/mappers/WeatherMap';
import { useSearchlocation } from '@/providers/SearchLocationProvider';
import { HourlyWeather } from '@/types/Weather';
import { formatHour } from '@/utils/format';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { fetchWeatherApi } from 'openmeteo';
import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Keyboard, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { LineChart } from "react-native-gifted-charts";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function TodayScreen() {
	const { location, errorMessage, setErrorMessage } = useSearchlocation();
	const [loading, setLoading] = useState(false);
	const [hourlyWeather, setHourlyWeather] = useState<HourlyWeather[]>([]);
	const colorScheme = useColorScheme();
	const tintColor = Colors[colorScheme ?? "light"].tintColor;
	const blueText = Colors[colorScheme ?? "light"].blueText;
	const textcolor = Colors[colorScheme ?? "light"].text;

	const fetchWeatherDatas = useCallback(async () => {
		if (!location) return;
		setLoading(true);
		setErrorMessage(null);

		try {
			const params = {
				latitude: location.latitude,
				longitude: location.longitude,
				hourly: ["weather_code", "temperature_2m", "wind_speed_10m"],
				forecast_days: 1
			};

			const responses = await fetchWeatherApi(WEATHER_URL, params);
			const response = responses[0];
			const hourly = response.hourly()!;
			const utcOffsetSeconds = response.utcOffsetSeconds();

			const start = Number(hourly.time());
			const end = Number(hourly.timeEnd());
			const step = hourly.interval();

			const mapped = [];
			const tempValues = hourly.variables(1)!.valuesArray()!;
			const windValues = hourly.variables(2)!.valuesArray()!;

			for (let i = 0; i < (end - start) / step; i++) {
				const date = new Date((start + i * step + utcOffsetSeconds) * 1000);
				mapped.push({
					time: formatHour(date),
					temperature: tempValues[i],
					windSpeed: windValues[i],
					weatherCode: hourly.variables(0)!.valuesArray()![i],
					value: tempValues[i],
					label: i % 2 == 0 ? formatHour(date) : undefined,
					dataPointText: `${tempValues[i].toFixed(2).toString()} °C`
				});
			}
			setHourlyWeather(mapped);
		} catch (e) {
			setErrorMessage("Service connection is lost. Please check your internet connection or try again later");
		} finally {
			setLoading(false);
		}
	}, [location]);

	useEffect(() => {
		fetchWeatherDatas();
	}, [fetchWeatherDatas])

	return (
		<View style={{ flex: 1}}>
			{loading ? (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<ActivityIndicator size="large" color={tintColor} />
				</View>
			) : (
				<>
					{location && !errorMessage && (
						<View style={styles.location}>
							<ThemedText type="title" color={blueText}>{location.name}</ThemedText>
							<ThemedText type="title">{location.admin1}, {location.country}</ThemedText>
						</View>
					)}
					{hourlyWeather.length > 0 && !errorMessage && (
						<View style={{flex: 1, justifyContent: "space-between"}}>
							<View
								style={{
									padding: 20,
									margin: 20,
									backgroundColor: '#ae1f1221'
								}}
							>
								<View style={{alignItems: "center", gap: 6}}>
									<ThemedText>Températures d'aujourd'hui</ThemedText>
									<LineChart
										areaChart
										curved 
										data={hourlyWeather}
										width={280}
										color={tintColor}
										dataPointsColor1={tintColor}
										textColor1={textcolor}	
										thickness={1}
										startFillColor={tintColor}
										startOpacity={0.8}
										endOpacity={0.2}
										yAxisColor={textcolor}
										hideRules
										xAxisLabelTextStyle={{color: textcolor}}
										xAxisColor={textcolor}
										isAnimated
										hideYAxisText
									/>
								</View>
							</View>
							<ScrollView
								style={styles.scrollView}
								onScrollBeginDrag={() => Keyboard.dismiss()}
								keyboardShouldPersistTaps="handled"
								horizontal={true}
							>
								{hourlyWeather.map((weather) => (
									<View key={weather.time} style={styles.column}>
										<ThemedText>{weather.time}</ThemedText>
										<View style={styles.weatherDescription}>
											<MaterialCommunityIcons name={getWeatherIcon(weather.weatherCode) as any} size={24} color={blueText} />
											<ThemedText style={{ textAlign: 'center' }}>{getWeatherDescription(weather.weatherCode)}</ThemedText>
										</View>
										<ThemedText color={tintColor}>{weather.temperature?.toFixed(2)} °C</ThemedText>
										<View style={styles.wind}>
											<FontAwesome5 name="wind" size={16} color={blueText} />
											<ThemedText>{weather.windSpeed?.toFixed(2)} km/h</ThemedText>
										</View>
									</View>
								))}
							</ScrollView>
						</View>
					)}
					{errorMessage && (
						<View style={styles.error}>
							<ThemedText type="default" color={errorTextColor} style={{ textAlign: 'center' }}>{errorMessage}</ThemedText>
						</View>
					)}
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	scrollView: {
		padding: 10,
		marginHorizontal: 20,
		backgroundColor: '#ae1f1221'
	},
	location: {
		flex: 0.3,
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
	},
	wind: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	column: {
		paddingHorizontal: 6,
		marginRight: 6,
		alignItems: "center",
		gap: 6
	},
	weatherDescription: {
		alignItems: "center",
		justifyContent: "center",
		gap: 4
	},
	error: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 50,
		marginLeft: 50
	}
});
