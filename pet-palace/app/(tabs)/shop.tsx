import { Text, View, StyleSheet } from 'react-native';

import Button from '@/components/Button';

export default function ShopScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Purchase items for your pets!</Text>
            <View style={styles.footerContainer}>
                <Button theme="primary" label="Adopt a Cat" />
                <Button label="Buy a toy" />
            </View>
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
    footerContainer: {
        flex: 1 / 3,
        alignItems: 'center'
    },
    text: {
        color: '#fff',
    }
});