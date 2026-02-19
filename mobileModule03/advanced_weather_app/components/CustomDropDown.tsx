import { Colors } from "@/constants/theme";
import { Keyboard, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ReactElement } from "react";

export type CustomDropdownProps = {
	data: any[];
	labelKey: string;
	onChange: (value: any) => void;
	icon?: ReactElement
}


export function CustomDropdown({
	data,
	labelKey,
	onChange,
	icon
}: CustomDropdownProps) {
	const colorScheme = useColorScheme();
	const backgroundColor = Colors[colorScheme ?? 'light'].background;
	const tintColor = Colors[colorScheme ?? "light"].tintColor;

	return (
		<View style={styles.container} pointerEvents="box-none">
			<View style={[styles.dropdownList, { backgroundColor: backgroundColor, borderColor: tintColor}]} pointerEvents="auto">
				<ScrollView
					nestedScrollEnabled={true}
					keyboardShouldPersistTaps="handled"
					style={styles.scrollView}
				>
					{data.map((item, index) => (
						<TouchableOpacity
							key={index}
							style={[styles.item,
							{ backgroundColor: backgroundColor }
							]}
							onPress={() => {
								Keyboard.dismiss();
								onChange(item);
							}}
						>
							{icon && icon}
							<ThemedText>{item[labelKey]}</ThemedText>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 50,
		left: -40,
		right: -40,
		zIndex: 1001,
		maxHeight: '90%',
	},
	scrollView: {
		flex: 1,
	},
	item: {
		padding: 15,
		borderRadius: 8,
		flexDirection: "row",
		gap: 6,
		alignItems: "center"
	},
	dropdownList: {
		marginLeft: 25,
		borderWidth: 2,
		borderRadius: 8,
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
	},
});
