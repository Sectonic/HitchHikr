import { Stack } from "expo-router";
import COLORS from "../../lib/colors";

export default function Layout() {
    return (
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
    )
}