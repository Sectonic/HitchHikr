import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Image } from 'expo-image';
import MapStyles from '../assets/map_styles.json';
import { Stack } from 'expo-router';
import { useSession } from '../lib/provider';
import LoadingScreen from '../components/loadingscreen';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Page() {
    const { session, isLoading } = useSession();

    // const [initialRegion, setInitialRegion] = useState(null);
    
    // useEffect(() => {
    //     (async () => {

    //         let { status } = await Location.requestForegroundPermissionsAsync();
    //         if (status === 'granted') {
    //             let { coords } = await Location.getCurrentPositionAsync({});
    //             setInitialRegion(prev => ({ 
    //                 ...prev, 
    //                 latitude: coords.latitude, 
    //                 longitude: coords.longitude,
    //                 latitudeDelta: 0.75,
    //                 longitudeDelta: 0.75
    //             })
    //             );
    //         }
            
    //     })();
    // }, []);

    if (isLoading) {
        return <LoadingScreen />
    }
    
    // return (
    //     <View style={{ flex: 1, backgroundColor: 'white' }}>
    //         <Stack.Screen
    //             options={{ headerShown: false }} 
    //         />
    //         <MapView style={{ flex: 1 }} 
    //             initialRegion={initialRegion} 
    //             provider={PROVIDER_GOOGLE}
    //             customMapStyle={MapStyles}
    //         >
    //             <Marker coordinate={initialRegion} title="Your Location" />
    //         </MapView>
    //     </View>
    // );

    return (
        <SafeAreaView style={{flex: 1, paddingHorizontal: 20}} >
            <Stack.Screen
                options={{ headerShown: false }} 
            />
            <Text style={{fontSize: 30, fontWeight: 700}} >HitchHikr</Text>
            <View style={{}} >
                <Text>{session || 'No Session'}</Text>
            </View>
        </SafeAreaView>
    )

}