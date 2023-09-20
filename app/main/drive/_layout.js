import { Stack, Tabs } from "expo-router";
import COLORS from "../../../lib/colors";

export default function Layout() {
    return (
        <>
            <Tabs.Screen
                options={{
                    headerShown: false
                }}
            />
            <Stack
                screenOptions={{
                    headerStyle: {
                    backgroundColor: 'white',
                    },
                    headerTintColor: COLORS.green,
                    headerTitleStyle: {
                    fontWeight: 'bold',
                    },
                }}
            />
        </>
    )
}