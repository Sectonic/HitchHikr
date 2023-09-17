import { Stack } from "expo-router";
import { View, Text } from "react-native";

export default function Page() {
    return (
        <View style={{ flex: 1 , backgroundColor: 'white' }} >
            <Stack.Screen options={{title: 'Sign Up'}} />
            <Text>View</Text>
        </View>
    )
}