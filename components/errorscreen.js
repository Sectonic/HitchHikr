import { SafeAreaView, Text, TouchableOpacity, View } from "react-native"
import { Stack, useRouter } from "expo-router"
import { Image } from "expo-image"

const ErrorScreen = ({ error, title, href, refresh }) => {
    const router = useRouter();

    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 15, backgroundColor: 'white', paddingHorizontal: 30 }} > 
            <Stack.Screen
                options={{ headerShown: false }} 
            />
            <Image
                style={{ width: 80, height: 80 }}
                source={require('../assets/warning.gif')}
            />
            <View>
                <Text style={{ fontSize: 17, fontWeight: 600, textAlign: 'center' }}>ERROR</Text>
                <Text style={{ textAlign: 'center'}} >"{error}"</Text>
            </View>
            <TouchableOpacity onPress={() => router.push(href)} style={{ width: 200, borderWidth: 1, borderRadius: 10, paddingVertical: 5 }} >
                <Text style={{ fontSize: 15, textAlign: 'center' }} >Go to {title}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={refresh} style={{ width: 200, borderWidth: 1, borderRadius: 10, paddingVertical: 5 }} >
                <Text style={{ fontSize: 15, textAlign: 'center' }} >Refresh</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default ErrorScreen;