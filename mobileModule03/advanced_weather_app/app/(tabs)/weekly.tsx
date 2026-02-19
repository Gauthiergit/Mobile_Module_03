import { ThemedText } from '@/components/ThemedText';
import { Colors, errorTextColor } from '@/constants/theme';
import { WEATHER_URL } from '@/constants/url';
import { getWeatherDescription, getWeatherIcon } from '@/mappers/WeatherMap';
import { useSearchlocation } from '@/providers/SearchLocationProvider';
import { WeeklyWeather, MinTempWeather } from '@/types/Weather';
import { formatDate } from '@/utils/format';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { fetchWeatherApi } from 'openmeteo';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, StyleSheet, View, ScrollView, useColorScheme } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

export default function WeeklyScreen() {
	const { location, errorMessage, setErrorMessage } = useSearchlocation();
	const [loading, setLoading] = useState(false);
	const [weeklyWeather, setWeeklyWeather] = useState<WeeklyWeather[]>([]);
	const [minTempWeather, setMinTempWeather] = useState<MinTempWeather[]>([]);
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
				daily: ["weather_code", "temperature_2m_max", "temperature_2m_min"],
			};

			const responses = await fetchWeatherApi(WEATHER_URL, params);
			const response = responses[0];
			const daily = response.daily()!;
			const utcOffsetSeconds = response.utcOffsetSeconds();

			const start = Number(daily.time());
			const end = Number(daily.timeEnd());
			const step = daily.interval();

			const mappedWeeklyWeather = [];
			const mappedMinTempWeather = [];
			const tempMax = daily.variables(1)!.valuesArray()!;
			const tempMin = daily.variables(2)!.valuesArray()!;

			for (let i = 0; i < (end - start) / step; i++) {
				const date = new Date((start + i * step + utcOffsetSeconds) * 1000);
				mappedWeeklyWeather.push({
					date: formatDate(date),
					temperatureMax: tempMax[i],
					temperatureMin: tempMin[i],
					weatherCode: daily.variables(0)!.valuesArray()![i],
					value: tempMax[i],
					label: i % 2 == 0 ? formatDate(date) : undefined,
					dataPointText: `${tempMax[i].toFixed(2).toString()} °C`
				});
				mappedMinTempWeather.push({
					value: tempMin[i],
					label: i % 2 == 0 ? formatDate(date) : undefined,
					dataPointText: `${tempMin[i].toFixed(2).toString()} °C`
				});

			}
			setWeeklyWeather(mappedWeeklyWeather);
			setMinTempWeather(mappedMinTempWeather);
		} catch (e) {
			setErrorMessage(
				"Service connection is lost. Please check your internet connection or try again later"
			);
		} finally {
			setLoading(false);
		}
	}, [location]);

	useEffect(() => {
		fetchWeatherDatas();
	}, [fetchWeatherDatas])

	return (
		<View style={{ flex: 1, backgroundColor: "transparent"}}>
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
					{weeklyWeather.length > 0 && !errorMessage && (
						<View style={{flex: 1, justifyContent: "space-between"}}>
							<View
								style={{
									padding: 20,
									margin: 20,
									backgroundColor: '#ae1f1221'
								}}
							>
								<View style={{alignItems: "center", gap: 6}}>
									<ThemedText>Températures de la semaine</ThemedText>
									<LineChart
										areaChart
										curved 
										data={weeklyWeather}
										data2={minTempWeather}
										width={280}
										color1={tintColor}
										color2={blueText}
										dataPointsColor1={tintColor}
										dataPointsColor2={blueText}
										textColor1={textcolor}
										textColor2={textcolor}
										thickness={1}
										startFillColor1={tintColor}
            							startFillColor2={blueText}
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
								{weeklyWeather.map((weather) => (
									<View key={weather.date} style={styles.column}>
										<ThemedText>{weather.date}</ThemedText>
										<View style={styles.weatherDescription}>
											<MaterialCommunityIcons name={getWeatherIcon(weather.weatherCode) as any} size={24} color={textcolor} />
											<ThemedText style={{ textAlign: 'center' }}>{getWeatherDescription(weather.weatherCode)}</ThemedText>
										</View>
										<ThemedText color={tintColor}>{weather.temperatureMax?.toFixed(2)} °C</ThemedText>
										<ThemedText color={blueText}>{weather.temperatureMin?.toFixed(2)} °C</ThemedText>
										
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
	location: {
		flex: 0.3,
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
	},
	scrollView: {
		padding: 10,
		marginHorizontal: 20,
		backgroundColor: '#ae1f1221'
	},
	header: {
		paddingTop: 20,
		paddingBottom: 10,
		alignItems: "center"
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
