import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { Stack, useRouter } from "expo-router"
import { useEffect, useState } from "react";
import { getStorageItem, setStorageItem } from "../../lib/secureStorage";
import { API_URL } from "../../lib/config";
import LoadingScreen from "../../components/loadingscreen";
import COLORS from "../../lib/colors";
import { Octicons } from "@expo/vector-icons";
import { AntDesign } from '@expo/vector-icons'; 

export default function Page() {
    const [userData, setUserData] = useState(null);
    const [edited, setEdited] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogout = async () => {
        await setStorageItem('session', null);
        router.push('/authentication');
    }

    const handleEdit = async () => {
        

        if (!userData.name) {
            setError('Please enter a valid name');
            return;
        }

        setSaving(true);

        const session = await getStorageItem('session');

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...userData, user_id: session }) 
        }

        const request = await fetch(`${API_URL}/accounts/edit`, options)
        const data = await request.json();

        if (request.ok) {
            setUserData(data);
        } else {
            setError(data.description)
            setSaving(false);
        }

        setSaving(false);
        setEdited(false);
    }

    useEffect(() => {
        (async () => {
            const session = await getStorageItem('session');
            const request = await fetch(`${API_URL}/accounts/get?` + new URLSearchParams({ hash: session }));
            const data = await request.json();
            setUserData(data);
        })();
    }, [])

    if (userData === null) {
        return <LoadingScreen />
    }

    return (
        <SafeAreaView style={{ flex: 1, paddingHorizontal: 20, backgroundColor: 'white' }} >
            <Stack.Screen
                options={{ headerShown: false }} 
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} >
                <View>
                    <Text style={{ fontSize: 40, fontWeight: 'bold', color: COLORS.green }}>Welcome</Text>
                    <Text style={{ fontSize: 15 }}>Ready for an adventure, {userData.name}?</Text>
                </View>
                <TouchableOpacity style={{ marginRight: 15 }} onPress={handleLogout} >
                    <AntDesign name="logout" size={32} color={COLORS.darkGray} />
                </TouchableOpacity>
            </View>
            <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => router.push('/main/carpool/')} style={{ flexBasis: '47.5%', borderRadius: 10, backgroundColor: COLORS.green, borderWidth: 3, borderColor: COLORS.green, justifyContent: 'center', alignItems: 'center', paddingVertical: 30, gap: 4 }}>
                    <Octicons name="people" size={30} color='white' />
                    <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Join a Carpool</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/main/drive/')} style={{ flexBasis: '47.5%', borderRadius: 10, borderWidth: 3, borderColor: COLORS.lightGreen, justifyContent: 'center', alignItems: 'center', paddingVertical: 30, gap: 4 }}>
                    <Octicons name="broadcast" size={30} color='black' />
                    <Text style={{ fontSize: 20, color: 'black', fontWeight: 'bold', textAlign: 'center' }}>Offer a Ride</Text>
                </TouchableOpacity>
            </View>
            <Text style={{ marginTop: 20, fontSize: 27, fontWeight: 700 }} >Your <Text style={{ color: COLORS.green }} >Profile</Text></Text>
            <ScrollView style={{ marginTop: 10, width: '100%', paddingHorizontal: 5 }} >
                { error.length > 0 && <Text style={{ fontSize: 17, paddingTop: 7, textAlign: 'center', color: COLORS.red }} >{error}</Text>}
                <Text style={{ marginLeft: 10, fontSize: 15 }} >Name:</Text>
                <TextInput 
                    secureTextEntry={false}
                    placeholder="John Doe"
                    placeholderTextColor={COLORS.lightGray}
                    value={userData.name}
                    onChangeText={(val) => {setEdited(true);setUserData(prev => (({...prev, name: val})))}}
                    style={{ marginTop: 4, color: 'black', width: '100%', padding: 10, fontSize: 16, borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 10 }}
                />
                <Text style={{ marginLeft: 10, fontSize: 15, marginTop: 15 }} >Email:</Text>
                <TextInput 
                    secureTextEntry={false}
                    placeholder="John Doe"
                    placeholderTextColor={COLORS.lightGray}
                    value={userData.email}
                    editable={false}
                    style={{ marginTop: 4, color: COLORS.darkGray, width: '100%', padding: 10, fontSize: 16, borderWidth: 1, borderColor: COLORS.veryLightGray, backgroundColor: COLORS.veryLightGray, borderRadius: 10 }}
                />
                <Text style={{ marginLeft: 10, fontSize: 15, marginTop: 15 }} >Password:</Text>
                <TextInput 
                    placeholder="John Doe"
                    placeholderTextColor={COLORS.lightGray}
                    value={'Password'}
                    editable={false}
                    secureTextEntry={true}
                    style={{ marginTop: 4, color: COLORS.darkGray, width: '100%', padding: 10, fontSize: 16, borderWidth: 1, borderColor: COLORS.veryLightGray, backgroundColor: COLORS.veryLightGray, borderRadius: 10 }}
                />
                <Text style={{ marginTop: 15, marginLeft: 10, fontSize: 15 }} >Maximum Walking Distance (miles):</Text>
                <TextInput 
                    secureTextEntry={false}
                    placeholder="Maximum walking distance"
                    placeholderTextColor={COLORS.lightGray}
                    value={userData.hasOwnProperty('walking_distance') && userData.walking_distance ? userData.walking_distance.toString() : null}
                    keyboardType='numeric'
                    onChangeText={(val) => {setEdited(true);setUserData(prev => (({...prev, walking_distance: val})))}}
                    style={{ marginTop: 4, color: 'black', width: '100%', padding: 10, fontSize: 16, borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 10 }}
                />
                <Text style={{ marginTop: 15, marginLeft: 10, fontSize: 15 }} >Car Model:</Text>
                <TextInput 
                    secureTextEntry={false}
                    placeholder="2014 Toyota Camry"
                    placeholderTextColor={COLORS.lightGray}
                    value={userData.car_model}
                    onChangeText={(val) => {setEdited(true);setUserData(prev => (({...prev, car_model: val})))}}
                    style={{ marginTop: 4, color: 'black', width: '100%', padding: 10, fontSize: 16, borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 10 }}
                />
                <Text style={{ marginTop: 15, marginLeft: 10, fontSize: 15 }} >Description:</Text>
                <TextInput 
                    secureTextEntry={false}
                    placeholder="Any extra information a carpooler should know about you"
                    placeholderTextColor={COLORS.lightGray}
                    value={userData.description}
                    multiline={true}
                    onChangeText={(val) => {setEdited(true);setUserData(prev => (({...prev, description: val})))}}
                    style={{ marginTop: 4, color: 'black', width: '100%', padding: 10, fontSize: 16, borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 10, minHeight: 100 }}
                />
                <TouchableOpacity onPress={edited ? handleEdit : null} style={{ marginTop: 20 ,paddingVertical: 10, width: '100%', backgroundColor: edited ? COLORS.green : COLORS.darkGray, borderRadius: 10 }}>
                    <Text style={{ textAlign: 'center', color: 'white', fontSize: 17, fontWeight: 500 }} >{ saving ? 'Saving...' : (edited ? 'Save' : 'Already Saved') }</Text>
                </TouchableOpacity>
                <View style={{ height: 200 }} ></View>
            </ScrollView>
        </SafeAreaView>
    )
}