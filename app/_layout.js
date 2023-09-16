import { Slot, Tabs } from "expo-router";
import { Octicons } from '@expo/vector-icons'; 
import COLORS from "../lib/colors";
import { SessionProvider } from "../lib/provider";

export default function Layout() {
    
    return (
        <SessionProvider>
            <Tabs screenOptions={{ tabBarActiveTintColor: COLORS.lightGreen, tabBarInactiveTintColor: COLORS.lightGray }}>
                <Tabs.Screen name="index" options={{ tabBarIcon: ({ color })  => (
                    <Octicons name="home" size={24} color={color} />
                ), tabBarLabel: 'home' }} />
                <Tabs.Screen name="carpool" options={{ tabBarIcon: ({ color })  => (
                    <Octicons name="people" size={24} color={color} />
                )}} />
                <Tabs.Screen name="drive" options={{ tabBarIcon: ({ color })  => (
                    <Octicons name="broadcast" size={24} color={color} />
                )}} />
            </Tabs>
        </SessionProvider>
    )
}