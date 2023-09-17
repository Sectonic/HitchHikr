import { View, Text } from "react-native";
import { Stack } from "expo-router";

export default function Page() {
    return (
        <View style={{ flex: 1 , backgroundColor: 'white' }} >
            <Stack.Screen options={{title: 'Log In'}} />
            <Text>View</Text>
        </View>
    )
}