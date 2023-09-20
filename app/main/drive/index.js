import { View, Text, SafeAreaView, FlatList, TouchableOpacity } from "react-native"
import { Stack, useRouter, Tabs } from "expo-router"
import { useEffect, useState } from "react"
import LoadingScreen from "../../../components/loadingscreen";
import ErrorScreen from "../../../components/errorscreen";
import { getStorageItem } from "../../../lib/secureStorage";
import { API_URL } from "../../../lib/config";
import COLORS from "../../../lib/colors";
import { Image } from "expo-image";

export default function Page() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [loadingError, setloadingError] = useState('');
    const [carpools, setCarpools] = useState([]);

    const getData = async () => {
        const session = await getStorageItem('session');
        const request = await fetch(`${API_URL}/carpool/get?` + new URLSearchParams({ hash: session, type: 'driver' }));
        const data = await request.json();

        setLoading(false);
        if (!request.ok) {
            setloadingError(data.description);
        } else {
            setCarpools(data.carpools);
            setloadingError('')
        } 
    }

    useEffect(() => {
        getData();
    }, [])

    if (loading) {
        return <LoadingScreen />
    }

    if (loadingError.length > 0) {
        return <ErrorScreen error={loadingError} title="Home" href="/main" refresh={getData} />
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20 }} >
            <Stack.Screen
                options={{ headerShown: false }}
            />
            <Tabs.Screen
                options={{ headerShown: false }}
            />
            <Text style={{ fontSize: 35, fontWeight: 700 }} >Carpools as <Text style={{ color: COLORS.green }} >Driver</Text></Text>
            <TouchableOpacity onPress={() => router.push('/main/drive/create')}  style={{ paddingVertical: 10, width: '100%', backgroundColor: COLORS.green, borderRadius: 10, marginTop: 15 }}>
                <Text style={{ textAlign: 'center', color: 'white', fontSize: 17, fontWeight: 500 }} >Create New Drive</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={getData}  style={{ paddingVertical: 5, width: 100, borderWidth: 2, borderColor: COLORS.lightGreen, borderRadius: 10, marginTop: 15, marginBottom: -10 }}>
                <Text style={{ textAlign: 'center', fontSize: 17, fontWeight: 500 }} >Refresh</Text>
            </TouchableOpacity>
            <FlatList
                data={carpools}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => router.push('/main/drive/' + item.id)} style={{ marginTop: 20, width: '100%', borderRadius: 10, borderWidth: 1, borderColor: COLORS.lightGray, flexDirection: 'row', justifyContent: 'space-between', alignItems: item.active ? 'flex-end' : 'center', padding: 20, gap: 20 }} >
                        <View style={{ flexBasis: '60%' }} >
                            {item.active && (
                                <View style={{ backgroundColor: COLORS.green, paddingVertical: 4, borderRadius: 5, width: '50%' }} >
                                    <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 700 }} >LIVE</Text>
                                </View>
                            )}
                            <Text style={{ fontSize: 20, fontWeight: 600, marginTop: 5 }} >{item.start_time}</Text>
                            <Text style={{ fontSize: 15, marginTop: 8 }} >• from {item.start_address}</Text>
                            <Text style={{ fontSize: 15 }} >• to {item.end_address}</Text>
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'center', gap: 10 }} >
                            <Image 
                                style={{ width: 40, height: 40 }}
                                source={require('../../../assets/wheel.svg')}
                            />
                            <View>
                                <Text style={{ fontSize: 15, fontWeight: 500, textAlign: 'center' }} >{item.carpoolers} Carpoolers</Text>
                                <Text style={{ fontSize: 15, fontWeight: 500, textAlign: 'center' }} >{item.distance.toFixed(2)} Miles</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                keyExtractor={(item, i) => i.toString()}
            />
        </SafeAreaView>
    )
}