import { TouchableOpacity, View } from "react-native"
import { ScrollView, Text } from "react-native"
import COLORS from "../lib/colors";
import MapView, { PROVIDER_GOOGLE, Polyline, Marker } from "react-native-maps";
import MapStyles from '../assets/map_styles.json';
import { useEffect, useState } from "react";
import { API_URL } from "../lib/config";
import LoadingScreen from "./loadingscreen";
import decodePolyline from "../lib/polyline";
import { getStorageItem } from "../lib/secureStorage";
import { useRouter } from "expo-router";
import { io } from 'socket.io-client';

const socket = io(API_URL);

const RequestCarpool = ({ carpool, location, destination }) => {
    const router = useRouter();
    const [directionData, setDirectionData] = useState(null);
    const [requested, setRequested] = useState(false);
    const [rejected, setRejected] = useState(false);

    const requestToDriver = async () => {
        const user_id = await getStorageItem('session');
        socket.emit('join_request', { carpool_id: carpool.id, user_id, location: `(${location.latitude},${location.longitude})`, destination: `(${destination.latitude},${destination.longitude})`, stops: directionData.stops, });
        setRequested(true);
    }

    const handleResponse = async (message) => {
        const user_id = await getStorageItem('session');
        if (message.user_id === user_id) {
            if (message.accept) {
                const request = await fetch(`${API_URL}/carpool/connect`);
                if (request.ok) {
                    router.push('/main/carpool/' + carpool.id);
                } else {
                    setRejected(true);
                }
            } else {
                setRejected(true);
            }
        }
    }

    useEffect(() => {
        (async () => {
            const request = await fetch(`${API_URL}/maps/get_carpool_route?` + new URLSearchParams({ polyline: carpool.polyline, userLocation: `(${location.latitude},${location.longitude})`, userDestination: `(${destination.latitude},${destination.longitude})` }));
            const data = await request.json();
            setDirectionData({...data, directions: data.directions.map(direction => ({...direction, polylineCoords: decodePolyline(direction.polyline) }))});
        })();

        
        socket.on('join_response_notification', handleResponse);

        return () => {
          socket.off('join_response_notification', handleResponse);
        };

    }, [])

    if (!directionData) {
        return <LoadingScreen withStack={true} />
    }

    return (
        <ScrollView style={{ paddingHorizontal: 20 }} >
            <View style={{ width: '100%', backgroundColor: carpool.polylineColor, height: 10, borderRadius: 5 }} />
            <Text style={{ fontSize: 25, marginTop: 10, fontWeight: 600 }} >Carpool Route</Text>
            <Text style={{ fontSize: 15, fontWeight: 500 }} >From {carpool.start_address}</Text>
            <Text style={{ fontSize: 15, fontWeight: 500 }} >To {carpool.end_address}</Text>
            <View style={{ marginTop: 5, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 10, flexDirection: 'row' }} >
                <View style={{ backgroundColor: COLORS.green, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, textAlign: 'center' }} >
                    <Text style={{ fontSize: 15, fontWeight: 600, color: 'white'}} >Driving Time: {Math.round(directionData.driving_time)} Mins</Text>
                </View>
                <View style={{ backgroundColor: COLORS.darkGray, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, textAlign: 'center' }} >
                    <Text style={{ fontSize: 15, fontWeight: 600, color: 'white'}} >Walking Time: {Math.round(directionData.walking_time)} Mins</Text>
                </View>
            </View>
            <MapView
                style={{ height: 300, margin: 20, borderRadius: 20 }}
                initialRegion={{
                    latitude: directionData.midpoint.latitude,
                    longitude: directionData.midpoint.longitude,
                    latitudeDelta: directionData.zoom_level.latitude_delta,
                    longitudeDelta: directionData.zoom_level.longitude_delta
                }}
                showsUserLocation={true}
                provider={PROVIDER_GOOGLE}
                customMapStyle={MapStyles}
            >
                {directionData.directions.map((direction, i) => (
                    <Polyline 
                        key={i}
                        coordinates={direction.polylineCoords}
                        strokeWidth={6}
                        strokeColor={i === 1 ? COLORS.green : COLORS.darkGray}   
                        lineDashPattern={i !== 1 ? [20, 5] : null}
                    />
                ))}
                <Marker
                    coordinate={destination}
                    image={require('../assets/destination.png')}
                />
            </MapView>
            <Text style={{ fontSize: 20, fontWeight: 600 }} >Driven by {carpool.driver.name}</Text>
            <Text style={{ fontSize: 15, fontWeight: 500 }} >{carpool.driver.car_model}</Text>
            <Text style={{ fontSize: 15, fontWeight: 500 }} >Maximum Occupancy: {carpool.total_occupancy}, Current Occupancy: {carpool.current_occupancy}</Text>
            <Text style={{ fontSize: 15, fontWeight: 500, marginTop: 5 }} >'{carpool.driver.description}'</Text>
            <View style={{ marginTop: 15, justifyContent: 'center', alignItems: 'center' }} >
                { requested ? (
                    <TouchableOpacity style={{ backgroundColor: rejected ? COLORS.red : COLORS.darkGray, borderRadius: 10, padding: 10, textAlign: 'center' }} >
                            { rejected ? (
                                <Text style={{ fontSize: 17, fontWeight: 600, color: 'white'}} >Rejected</Text>
                            ) : (
                                <Text style={{ fontSize: 17, fontWeight: 600, color: 'white'}} >Pending...</Text>
                            )}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={requestToDriver} style={{ backgroundColor: COLORS.green, borderRadius: 10, padding: 10, textAlign: 'center' }} >
                        <Text style={{ fontSize: 17, fontWeight: 600, color: 'white'}} >Request to Carpool</Text>
                    </TouchableOpacity>
                )}
                </View>
            <View style={{ height: 50 }} ></View>
        </ScrollView>
    )
}

export default RequestCarpool;