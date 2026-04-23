import { ImageSourcePropType, Text, View, StyleSheet } from 'react-native';
import { useState } from 'react';

import ImageViewer from '@/components/ImageViewer';
import ToyImage from '@/components/ToyImage';

const PlaceholderImage = require('@/assets/images/rooms/pink-room.png')
const PlaceholderImage2 = require('@/assets/images/rooms/cabin-room.png')

export default function PalaceScreen() {

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <ImageViewer imgSource={PlaceholderImage} />
                {/*pickedToy && */<ToyImage imageSize={40} imageSource={PlaceholderImage2} />}
            </View>
            <View style={styles.imageContainer}>
                <ImageViewer imgSource={PlaceholderImage2} />
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