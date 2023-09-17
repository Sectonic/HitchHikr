import { View } from "react-native"
import { Stack } from "expo-router"

export default function Page() {

    return (
        <View style={{ flex: 1 }} >
            <Stack.Screen
                options={{ headerShown: false }} 
            />
        </View>
    )
}