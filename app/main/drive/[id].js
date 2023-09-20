import { View, Text,FlatList, TouchableOpacity } from "react-native"
import { Stack, useFocusEffect, useLocalSearchParams } from "expo-router"
import { useCallback, useState } from "react";
import LoadingScreen from "../../../components/loadingscreen";
import { API_URL } from "../../../lib/config";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import MapStyles from '../../../assets/map_styles.json';
import COLORS from "../../../lib/colors";
import decodePolyline from "../../../lib/polyline";
import { Image } from "expo-image";
import { io } from 'socket.io-client';

const socket = io(API_URL);

export default function Page() {
    const local = useLocalSearchParams();
    const [carpool, setCarpool] = useState(null);
    const [liveCoords, setLiveCoords] = useState(null);
    const [location, setLocation] = useState({});
    const [activelyGettingCords, setActivelyGettingCords] = useState(false);
    const [carpoolers, setCarpoolers] = useState([]);
    const [requestingCarpoolers, setRequestingCarpoolers] = useState([]);
    
    const getLiveCoords = async () => {
        if (!activelyGettingCords) {
            setActivelyGettingCords(true);
            const request = await fetch(`${API_URL}/maps/get_route?` + new URLSearchParams({ origin: `(${location.latitude},${location.longitude})`, destination: `(${carpool.polyline[carpool.polyline.length - 1].latitude},${carpool.polyline[carpool.polyline.length - 1].longitude})` }));
            const data = await request.json();
            setLiveCoords(data.polylineCoords);
            await new Promise(resolve => setTimeout(resolve, 5000))
            setActivelyGettingCords(false);
        }
    }

    const convertStringToCoords = (inputString) => {
        const values = inputString.replace(/[()]/g, '').split(',');

        const latitude = parseFloat(values[0]);
        const longitude = parseFloat(values[1]);

        return { latitude, longitude };
    }

    const respondToRequest = async (carpooler, accept) => {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                carpool_id: carpooler.carpool_id,
                location: carpooler.location,
                destination: carpooler.destination,
                stops: carpooler.stops,
                user_id: carpooler.user_id, 
             })
        }
        await fetch(`${API_URL}/carpool/connect`, options);
        if (accept) {
            setCarpoolers(prev => [...prev, { name: carpooler.name, route_reach: convertStringToCoords(carpooler.stops[0]), route_depart: convertStringToCoords(carpooler.stops[1]), requesting: false }]);
        }
        setRequestingCarpoolers(prev => prev.filter(user => user.id !== carpooler.id));
        socket.emit('response_to_request', { accept, user_id: carpooler.user_id });
    }

    const handleResponse = async (request) => {
        if (request.carpool_id === carpool.id) {
            const fetchUser = await fetch(`${API_URL}/user/get?` + new URLSearchParams({ user_id: request.user_id }));
            const data = await fetchUser.json();
            setRequestingCarpoolers(prev => [...prev, { ...data, ...request, requesting: true }]);
        }
    }

    useFocusEffect(
        useCallback(() => {
            (async () => {
                const request = await fetch(`${API_URL}/carpool/${local.id}`);
                const data = await request.json();

                setCarpool({...data, polyline: decodePolyline(data.polyline)});
                setLiveCoords(decodePolyline(data.polyline));
            })();

            socket.on('join_request_notification', handleResponse);

            // Clean up the socket listener when the component unmounts
            return () => {
              socket.off('join_request_notification', handleResponse);
            };
        }, [])
    )

    if (!carpool) {
        return <LoadingScreen withStack={true} />
    }

    const RequestingUser = ({ item }) => (
        <View style={{ marginTop: 10, borderWidth: 2, borderColor: COLORS.lightGray, marginHorizontal: 20, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', padding: 7, borderRadius: 10 }} >
            <Text style={{ fontSize: 16, fontWeight: 600 }} >{item.name}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }} >
                <TouchableOpacity onPress={() => respondToRequest(item, true)} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: COLORS.green }} >
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 600 }} >Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => respondToRequest(item, false)} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: COLORS.red }} >
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 600 }} >Deny</Text>
                </TouchableOpacity>
            </View>
        </View> 
    )

    const NotRequestingUser = ({ item }) => (
        <View style={{ marginTop: 10, borderWidth: 2, borderColor: COLORS.lightGray, marginHorizontal: 20, justifyContent: 'flex-start', alignItems: 'center', gap: 10, flexDirection: 'row', padding: 7, borderRadius: 10 }} >
            <Text style={{ fontSize: 16, fontWeight: 600 }} >{item.name}</Text>
        </View>
    )

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }} >
            <Stack.Screen
                options={{
                    title: 'Drive View'
                }}
            />
            <View style={{ paddingHorizontal: 20, marginVertical: 20, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }} >
                <View style={{ flexBasis: '60%' }} >
                    {carpool.active && (
                        <View style={{ backgroundColor: COLORS.green, paddingVertical: 4, borderRadius: 5, width: '50%' }} >
                            <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 700 }} >LIVE</Text>
                        </View>
                    )}
                    <Text style={{ fontSize: 20, fontWeight: 600, marginTop: 5 }} >{carpool.start_time}</Text>
                    <Text style={{ fontSize: 15, marginTop: 8 }} >• from {carpool.start_address}</Text>
                    <Text style={{ fontSize: 15 }} >• to {carpool.end_address}</Text>
                </View>
                <View style={{ justifyContent: 'center', alignItems: 'center', gap: 10 }} >
                    <Image 
                        style={{ width: 40, height: 40 }}
                        source={require('../../../assets/wheel.svg')}
                    />
                    <View>
                        <Text style={{ fontSize: 15, fontWeight: 500, textAlign: 'center' }} >{carpool.carpoolers} Carpoolers</Text>
                        <Text style={{ fontSize: 15, fontWeight: 500, textAlign: 'center' }} >{carpool.distance.toFixed(2)} Miles</Text>
                    </View>
                </View>
            </View>
            <Text style={{ fontSize: 20, fontWeight: 700, marginLeft: 20 }} >Carpoolers</Text>
            <View style={{ maxHeight: 200, marginBottom: 15 }} >
                {[...requestingCarpoolers, ...carpoolers].length === 0 ? (
                    <Text style={{marginLeft: 40, marginTop: 5}} >No Current Carpoolers</Text>
                ) : (
                    <FlatList
                        data={[...requestingCarpoolers, ...carpoolers]} 
                        renderItem={({ item }) => (item.requesting ? <RequestingUser item={item} /> : <NotRequestingUser item={item} />)}
                        keyExtractor={(item, i) => i.toString()}    
                    />
                )}
            </View>
            <MapView 
                style={{flex: 1}}
                provider={PROVIDER_GOOGLE}
                region={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: .0075,
                    longitudeDelta: .0075
                }}
                customMapStyle={MapStyles}
                followsUserLocation={true}
                showsUserLocation={true}
                camera={{
                    center: {
                        latitude: location.latitude,
                        longitude: location.longitude
                    },
                    heading: location.heading,
                }}
                onUserLocationChange={(val) => {setLocation(val.nativeEvent.coordinate);getLiveCoords()}}
            >
                <Polyline
                    coordinates={carpool.polyline}
                    strokeWidth={6}
                    strokeColor={COLORS.darkGray}
                />
                <Polyline
                    coordinates={liveCoords}
                    strokeWidth={6}
                    strokeColor={COLORS.lightGreen}
                />
                {carpoolers.map(carpooler => (
                    <>
                        <Marker coordinate={{ latitude: carpooler.route_reach.latitude, longitude: carpooler.route_reach.longitude  }} image={require('../../../assets/add_marker.svg')}  />
                        <Marker coordinate={{ latitude: carpooler.route_depart.latitude, longitude: carpooler.route_depart.longitude  }} image={require('../../../assets/remove_marker.svg')}  />
                    </>
                ))}
            </MapView>
        </View>
    )
}