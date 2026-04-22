import { Text, View, StyleSheet } from 'react-native';

import ImageViewer from '@/components/ImageViewer';

const PlaceholderImage = require('@/assets/images/rooms/pink-room.png')

export default function PalaceScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <ImageViewer imgSource={PlaceholderImage} />
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
    imageContainer: {
        flex: 1,
    },
    text: {
        color: '#fff',
    }
});