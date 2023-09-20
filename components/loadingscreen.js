import { View } from 'react-native';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';

const LoadingScreen = ({ withStack }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }} >
        { !withStack && (
            <Stack.Screen
                options={{ headerShown: false }} 
            />
        )}
        <Image
            style={{ width: 80, height: 80 }}
            source={require('../assets/map_loading.gif')}
        />
    </View>
)

export default LoadingScreen;