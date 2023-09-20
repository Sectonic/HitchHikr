import { Text, SafeAreaView, View, TouchableOpacity } from "react-native";
import COLORS from "../../lib/colors";
import { Link, Stack, useRouter } from "expo-router";

export default function Page() {
    const router = useRouter();
    
    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }} >
            <Stack.Screen
                options={{ headerShown: false }} 
            />
            <Text style={{ fontSize: 45, fontWeight: 700 }} > Hitch<Text style={{ color: COLORS.lightGreen }} >Hikr</Text></Text>
            <Text style={{ fontSize: 15, fontWeight: 500, color: COLORS.lightGray }} >An innovative carpooling app.</Text>
            <View style={{ marginTop: 20, width: 250, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 10 }} >
                <TouchableOpacity onPress={() => router.push('/authentication/signup')} style={{ paddingVertical: 10, width: '100%', backgroundColor: COLORS.green, borderRadius: 10 }}>
                        <Text style={{ textAlign: 'center', color: 'white', fontSize: 17, fontWeight: 500 }} >Sign Up</Text>
                </TouchableOpacity>
                <Text>
                    Have an account? <Link href="/authentication/login" style={{marginLeft: 8, color: COLORS.lightGreen}} >Login</Link>
                </Text>
            </View>
        </SafeAreaView>
    )
}