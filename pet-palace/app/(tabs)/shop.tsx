import { Text, View, StyleSheet } from 'react-native';

export default function ShopScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Purchase items for your pets!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#fff',
    }
});