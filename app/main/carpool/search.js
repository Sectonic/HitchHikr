import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native"
import { Stack, useRouter } from "expo-router"
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import * as Location from "expo-location";
import LoadingScreen from "../../../components/loadingscreen";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import MapStyles from '../../../assets/map_styles.json';
import ErrorScreen from "../../../components/errorscreen";
import COLORS from "../../../lib/colors";
import { API_URL } from "../../../lib/config";
import { getStorageItem } from "../../../lib/secureStorage";
import decodePolyline from "../../../lib/polyline";
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import RequestCarpool from "../../../components/requestCarpool";
import { Platform } from "react-native";

export default function Page() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [initialRegion, setInitialRegion] = useState(null);
    const [locationCoords, setLocationCoords] = useState(null);
    const [destinationCoords, setDestinationCoords] = useState(null);
    const [locationAddress, setLocationAddress] = useState(null);
    const [destinationAddress, setDestinationAddress] = useState(null);
    const [suitableCarpools, setSuitableCarpools] = useState([]);
    const [currentCarPool, setCurrentCarPool] = useState(null);
    const [locationError, setLocationError] = useState('');

    const bottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ['70%'], []);
    const handlePresentPress = (carpool) => {
        setCurrentCarPool(carpool)
        bottomSheetRef.current.expand();
    }
    const handleSheetChanges = useCallback((index) => {
        if (index === -1) {
            setCurrentCarPool(null)
        }
    }, []);
    const renderBackdrop = useCallback(
        props => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
          />
        ),
        []
    )
    

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
            const reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: coords.latitude,
                longitude: coords.longitude,
            });
            if (reverseGeocode.length > 0) {
                setLocationCoords({ latitude: coords.latitude, longitude: coords.longitude })
                setLocationAddress(reverseGeocode[0].name)
            }
        } else {
            setLocationError('Please turn on location to continue');
        } 
    }

    const changeDestination = async (e) => {
        if (e.nativeEvent.coordinate?.latitude && e.nativeEvent.coordinate?.longitude) {
            const latitude = e.nativeEvent.coordinate.latitude;
            const longitude = e.nativeEvent.coordinate.longitude;
            const reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: latitude,
                longitude: longitude,
            });
            setDestinationAddress(reverseGeocode[0].name);
            setDestinationCoords({ latitude, longitude })
        }
    }

    const handleSearch = async () => {
        
        const hash = await getStorageItem('session');
        const request = await fetch(`${API_URL}/maps/get_suitable_carpools?` + new URLSearchParams({ hash, userLocation: `(${locationCoords.latitude},${locationCoords.longitude})`, userDestination: `(${destinationCoords.latitude},${destinationCoords.longitude})` }));
        const data = await request.json();
        const allColors = ["#000000","#1098F7","#261447","#EF5D60","#4CB5AE"]
        const usedColors = [];
    
        const getRandomColor = () => {
            let color;
            if (usedColors.length < allColors.length) {
                // If there are available predefined colors, select one
                do {
                    color = allColors[Math.floor(Math.random() * allColors.length)];
                } while (usedColors.includes(color));
            } else {
                // Generate a random color
                do {
                    const hue = Math.floor(Math.random() * 360); 
                    const saturation = Math.floor(Math.random() * 250) + 40; 
                    const lightness = Math.floor(Math.random() * 10) + 40; 
                    color = `hsl(${hue},${saturation}%,${lightness}%)`;
                } while (usedColors.includes(color)); 
            }
            usedColors.push(color);
            return color;
        }

        setSuitableCarpools(data.map(carpool => ({...carpool, polylineCoords: decodePolyline(carpool.polyline), polylineColor: getRandomColor()})));

    }
    
    useEffect(() => {
        getLocation();
    }, []);
    
    if (!initialRegion) {
        return <LoadingScreen withStack={true} />
    }

    if (locationError.length > 0) {
        return <ErrorScreen error={locationError} title='Carpool' href='/main/carpool' refresh={getLocation}  />
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }} >
            <Stack.Screen
                options={{
                    title: 'Search for Carpool'
                }}
            />
            <View style={{ paddingHorizontal: 20 }} >
                { error.length > 0 && <Text style={{ fontSize: 17, paddingTop: 7, textAlign: 'center', color: COLORS.red }} >{error}</Text>}
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
                <TouchableOpacity onPress={handleSearch} style={{ marginTop: 15 ,paddingVertical: 7, width: '100%', backgroundColor: COLORS.green, borderRadius: 10, marginBottom: 15 }}>
                    <Text style={{ textAlign: 'center', color: 'white', fontSize: 17, fontWeight: 500 }} >Search</Text>
                </TouchableOpacity>
            </View>
            <MapView style={{ flex: 1 }} 
                initialRegion={initialRegion} 
                provider={PROVIDER_GOOGLE}
                customMapStyle={MapStyles}
                onPress={changeDestination}
            >
                <Marker coordinate={locationCoords} image={require('../../../assets/location.png')}  />
                { destinationCoords && <Marker coordinate={destinationCoords} image={require('../../../assets/destination.png')}  /> }
                { suitableCarpools.map((carpool, i) => (
                    <Polyline
                        tappable={true}
                        onPress={() =>  handlePresentPress(carpool)}
                        key={i}
                        coordinates={carpool.polylineCoords}
                        strokeWidth={6}
                        strokeColor={carpool.polylineColor}
                    />
                )) }
            </MapView>
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                backdropComponent={renderBackdrop}
            >   
                { currentCarPool && <RequestCarpool carpool={currentCarPool} location={locationCoords} destination={destinationCoords} />}
            </BottomSheet>
        </View>
    )
}