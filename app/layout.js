import { Stack } from "expo-router";

export default function Root() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                backgroundColor: '#f4511e',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                fontWeight: 'bold',
                },
            }}
        />
    )
}