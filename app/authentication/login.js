import { View, Text, TextInput } from "react-native";
import { Stack, useRouter } from "expo-router";
import COLORS from "../../lib/colors";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useState } from "react";
import { setStorageItem } from "../../lib/secureStorage";
import { API_URL } from "../../lib/config";

export default function Page() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async () => {

        if (!email) {
            setError("Please enter a valid email");
            return;
        }

        if (!password) {
            setError("Please enter a valid password");
            return;
        }

        const request = await fetch(`${API_URL}/accounts/login?` + new URLSearchParams({ email, password }));
        const data = await request.json();
        if (request.ok) {
            await setStorageItem('session', data.user_id);
            router.push('/main');
        } else {
            setError(data.description);
        }

    }

    return (
        <View style={{ flex: 1 , backgroundColor: 'white', paddingHorizontal: 20 }} >
            <Stack.Screen options={{title: 'Log In'}} />
            <Text style={{ fontSize: 30, fontWeight: 700, marginTop: 20 }} >Welcome Back</Text>
            <Text style={{ fontSize: 17, color: COLORS.lightGray}} >Sign In to Continue</Text>
            { error.length > 0 && <Text style={{ fontSize: 17, paddingTop: 7, textAlign: 'center', color: COLORS.red }} >{error}</Text>}
            <Text style={{ marginLeft: 10, fontSize: 15, marginTop: 15 }} >Email Address:</Text>
            <TextInput 
                secureTextEntry={false}
                placeholder="name@company.xyz"
                placeholderTextColor={COLORS.lightGray}
                value={email}
                onChangeText={setEmail}
                style={{ marginTop: 4, color: 'black', width: '100%', padding: 10, fontSize: 16, borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 10 }}
            />
            <Text style={{ marginLeft: 10, fontSize: 15, marginTop: 15 }} >Password:</Text>
            <TextInput 
                placeholder="abcdefg"
                secureTextEntry={true}
                placeholderTextColor={COLORS.lightGray}
                value={password}
                onChangeText={setPassword}
                style={{ marginTop: 4, color: 'black', width: '100%', padding: 10, fontSize: 16, borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 10 }}
            />
            <TouchableOpacity onPress={handleSubmit} style={{ marginTop: 20 ,paddingVertical: 10, width: '100%', backgroundColor: COLORS.green, borderRadius: 10 }}>
                    <Text style={{ textAlign: 'center', color: 'white', fontSize: 17, fontWeight: 500 }} >Continue</Text>
            </TouchableOpacity>
        </View>
    )
}