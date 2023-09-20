import { View, Text, TextInput, TouchableOpacity } from "react-native"
import { Stack, useRouter } from "expo-router"
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import LoadingScreen from "../../../components/loadingscreen";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import MapStyles from '../../../assets/map_styles.json';
import ErrorScreen from "../../../components/errorscreen";
import COLORS from "../../../lib/colors";
import { API_URL } from "../../../lib/config";
import { getStorageItem } from "../../../lib/secureStorage";
import { Platform } from "react-native";

export default function Page() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [initialRegion, setInitialRegion] = useState(null);
    const [locationCoords, setLocationCoords] = useState(null);
    const [destinationCoords, setDestinationCoords] = useState(null);
    const [locationAddress, setLocationAddress] = useState(null);
    const [destinationAddress, setDestinationAddress] = useState(null);
    const [polyline, setPolyline] = useState(null);
    const [polylineCoords, setPolylineCoords] = useState(null);
    const [occupancy, setOccupancy] = useState(null);
    const [locationError, setLocationError] = useState('');

    const getLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            setLocationError('');
            let { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            if (Platform.isPad) {
                coords = { latitude: 40.518410, longitude: -105.008900 };
            }
            setInitialRegion(prev => ({ 
                ...prev, 
                latitude: coords.latitude, 
                longitude: coords.longitude,
                latitudeDelta: .1,
                longitudeDelta: .1
            })
            );
            setLocationCoords({ latitude: coords.latitude, longitude: coords.longitude })
            const reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: coords.latitude,
                longitude: coords.longitude,
            });
            if (reverseGeocode.length > 0) {
                setLocationAddress(reverseGeocode[0].name)
            }
        } else {
            setLocationError('Please turn on location to continue');
        } 
    }

    const changeDestination = async (e) => {
        const latitude = e.nativeEvent.coordinate.latitude;
        const longitude = e.nativeEvent.coordinate.longitude;
        const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: latitude,
            longitude: longitude,
        });
        const request = await fetch(`${API_URL}/maps/get_route?` + new URLSearchParams({ origin: `(${locationCoords.latitude},${locationCoords.longitude})`, destination: `(${latitude},${longitude})` }));
        const data = await request.json();
        setPolylineCoords(data.polylineCoords);
        setPolyline(data.polyline)
        setDestinationAddress(reverseGeocode[0].name);
        setDestinationCoords({ latitude: latitude, longitude: longitude })
    }

    const handleCreate = async () => {

        if (!occupancy) {
            setError('Please have a valid occupancy');
            return;
        }

        if (!destinationAddress) {
            setError('Please select a destination');
            return;
        }

        const hash = await getStorageItem('session');

        const options = { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                start_address: locationAddress,
                end_address: destinationAddress,
                polyline, occupancy, hash
             })
        }
        
        const request = await fetch(`${API_URL}/carpool/create`, options);
        const data = await request.json();

        if (request.ok) {
            router.replace('/main/drive/' + data.id);
        } else {
            setError(data.description);
        }
        
    }
    
    useEffect(() => {
        getLocation();
    }, []);
    
    if (!initialRegion) {
        return <LoadingScreen withStack={true} />
    }

    if (locationError.length > 0) {
        return <ErrorScreen error={locationError} title='Drive' href='/main/drive' refresh={getLocation}  />
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }} >
            <Stack.Screen
                options={{
                    title: 'Create New Drive'
                }}
            />
            <View style={{ paddingHorizontal: 20 }} >
                { error.length > 0 && <Text style={{ fontSize: 17, paddingTop: 7, textAlign: 'center', color: COLORS.red }} >{error}</Text>}
                <Text style={{ marginLeft: 10, fontSize: 15, marginTop: 15 }} >Maximum Occupancy:</Text>
                <TextInput 
                    secureTextEntry={false}
                    placeholder="Max number of carpoolers"
                    placeholderTextColor={COLORS.lightGray}
                    value={occupancy}
                    onChangeText={setOccupancy}
                    keyboardType='numeric'
                    style={{ marginTop: 4, color: 'black', width: '100%', padding: 7, fontSize: 16, borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 10 }}
                />
                <Text style={{ marginLeft: 10, fontSize: 15, marginTop: 10 }} >Location:</Text>
                <TextInput 
                    secureTextEntry={false}
                    placeholderTextColor={COLORS.lightGray}
                    value={locationAddress}
                    editable={false}
                    style={{ marginTop: 4, color: COLORS.darkGray, width: '100%', padding: 7, fontSize: 16, borderWidth: 1, borderColor: COLORS.veryLightGray, backgroundColor: COLORS.veryLightGray, borderRadius: 10 }}
                />
                <Text style={{ marginLeft: 10, fontSize: 15, marginTop: 10 }} >Destination:</Text>
                <TextInput 
                    secureTextEntry={false}
                    placeholder="Enter an address"
                    placeholderTextColor={COLORS.lightGray}
                    value={destinationAddress}
                    style={{ marginTop: 4, color: 'black', width: '100%', padding: 7, fontSize: 16, borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 10 }}
                />
                <TouchableOpacity onPress={handleCreate} style={{ marginTop: 15 ,paddingVertical: 7, width: '100%', backgroundColor: COLORS.green, borderRadius: 10, marginBottom: 15 }}>
                    <Text style={{ textAlign: 'center', color: 'white', fontSize: 17, fontWeight: 500 }} >Create</Text>
                </TouchableOpacity>
            </View>
            <MapView style={{ flex: 1 }} 
                initialRegion={initialRegion} 
                provider={PROVIDER_GOOGLE}
                customMapStyle={MapStyles}
                onPress={changeDestination}
            >
                <Marker coordinate={locationCoords} image={require('../../../assets/location.png')}  />
                { polylineCoords && (
                    <>
                        <Marker coordinate={destinationCoords} image={require('../../../assets/destination.png')} />
                        <Polyline
                            coordinates={polylineCoords}
                            strokeWidth={6}
                            strokeColor={COLORS.lightGreen}
                        />
                    </>
                )}
            </MapView>
        </View>
    )
}