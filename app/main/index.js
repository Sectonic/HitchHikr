import { SafeAreaView, View, Text } from "react-native-safe-area-context"
import { Stack } from "expo-router"

export default function Page() {
    return (
        <SafeAreaView style={{flex: 1, paddingHorizontal: 20}} >
            <Stack.Screen
                options={{ headerShown: false }} 
            />
            <Text style={{fontSize: 30, fontWeight: 700}} >HitchHikr</Text>
            <View style={{}} >
                <Text>No Session</Text>
            </View>
        </SafeAreaView>
    )
}