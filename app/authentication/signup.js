import { Stack, useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import COLORS from "../../lib/colors";
import { setStorageItem } from "../../lib/secureStorage";
import { useState } from "react";
import { API_URL } from "../../lib/config";

export default function Page() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async () => {

        if (!name) {
            setError("Please enter a valid name");
            return;
        }

        if (!email) {
            setError("Please enter a valid email");
            return;
        }

        if (!password) {
            setError("Please enter a valid password");
            return;
        }

        if (confirmPassword !== password) {
            setError("Your passwords do not match");
            return;
        }

        const options = { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        }
        
        const request = await fetch(`${API_URL}/accounts/register`, options);
        const data = await request.json();

        if (request.status === 200) {
            await setStorageItem('session', data.user_id);
            router.push('/main');
        } else {
            setError(data.description);
        }

    }

    return (
        <View style={{ flex: 1 , backgroundColor: 'white', paddingHorizontal: 20 }} >
            <Stack.Screen options={{title: 'Sign Up'}} />
            <Text style={{ fontSize: 30, fontWeight: 700, marginTop: 20 }} >Create Your Account</Text>
            <Text style={{ fontSize: 17, color: COLORS.lightGray}} >Sign up to continue</Text>
            { error.length > 0 && <Text style={{ fontSize: 17, paddingTop: 7, textAlign: 'center', color: COLORS.red }} >{error}</Text>}
            <Text style={{ marginLeft: 10, fontSize: 15, marginTop: 15 }} >Name:</Text>
            <TextInput 
                secureTextEntry={false}
                placeholder="John Doe"
                placeholderTextColor={COLORS.lightGray}
                value={name}
                onChangeText={setName}
                style={{ marginTop: 4, color: 'black', width: '100%', padding: 10, fontSize: 16, borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 10 }}
            />
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
            <Text style={{ marginLeft: 10, fontSize: 15, marginTop: 15 }} >Confirm Password:</Text>
            <TextInput 
                placeholder="abcdefg"
                secureTextEntry={true}
                placeholderTextColor={COLORS.lightGray}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={{ marginTop: 4, color: 'black', width: '100%', padding: 10, fontSize: 16, borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: 10 }}
            />
            <TouchableOpacity onPress={handleSubmit} style={{ marginTop: 20 ,paddingVertical: 10, width: '100%', backgroundColor: COLORS.green, borderRadius: 10 }}>
                    <Text style={{ textAlign: 'center', color: 'white', fontSize: 17, fontWeight: 500 }} >Continue</Text>
            </TouchableOpacity>
        </View>
    )
}