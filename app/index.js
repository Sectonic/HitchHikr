import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

export default function Page() {

    const [initialRegion, setInitialRegion] = useState(null);
    
    useEffect(() => {
        (async () => {

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let { coords } = await Location.getCurrentPositionAsync({});
                setInitialRegion(prev => ({ 
                    ...prev, 
                    latitude: coords.latitude, 
                    longitude: coords.longitude,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1
                })
                );
            }
            
        })();
    }, []);

    if (!initialRegion) {
        return (
            <View>
                <Text>Loading</Text>
            </View>
        )
    }
    
    return (
        <View style={{ flex: 1 }}>
          <MapView style={{ flex: 1 }} initialRegion={initialRegion} provider={PROVIDER_GOOGLE}>
            <Marker coordinate={initialRegion} title="Your Location" />
          </MapView>
        </View>
    );

}