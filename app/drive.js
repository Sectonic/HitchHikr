import { View } from "react-native"
import { useEffect } from "react";
import { useRouter, Stack } from "expo-router"
import { useSession } from '../lib/provider';

export default function Page() {
    const { session, isLoading } = useSession();
    const router = useRouter();

    if (isLoading) {
        return <LoadingScreen />
    }

    useEffect(() => {
        if (!session) {
            router.replace('/')
        }
    }, [session])

    return (
        <View style={{ flex: 1 }} >
            <Stack.Screen
                options={{ headerShown: false }} 
            />
        </View>
    )
}