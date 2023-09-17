import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Image } from 'expo-image';
import MapStyles from '../assets/map_styles.json';
import { Stack, useRouter } from 'expo-router';
import LoadingScreen from '../components/loadingscreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../lib/colors';
import { Redirect } from 'expo-router';
import { getStorageItem } from '../lib/secureStorage';

export default function Page() {
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const session = await getStorageItem('session');
            if (session) {
                router.push('/main');
            } else {
                router.push('/authentication');
            }
        })();
    }, [])

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

    return <LoadingScreen />
    
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

}