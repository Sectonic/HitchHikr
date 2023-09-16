import { View } from "react-native"
import { useRouter, Stack } from "expo-router"
import { useSession } from '../lib/provider';
import { useEffect } from "react";

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
    }, [isLoading])

    return (
        <View style={{ flex: 1 }} >
            <Stack.Screen
                options={{ headerShown: false }} 
            />
        </View>
    )
}