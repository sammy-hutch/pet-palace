import { ImageSourcePropType, Text, View, StyleSheet } from 'react-native';
import { useState} from 'react';
import { useDatabase } from '../../src/DatabaseContext';
import * as SQLite from 'expo-sqlite';

import Button from '@/components/Button';
import CircleButton from '@/components/CircleButton';
import IconButton from '@/components/IconButton';
import ToyList from '@/components/ToyList';
import ToyPicker from '@/components/ToyPicker';

export default function ShopScreen() {
    const [showPurchaseNudge, setShowPurchaseNudge] = useState<boolean>(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [pickedToy, setPickedToy] = useState<ImageSourcePropType | undefined>(undefined);

    const onReset = () => {
        setShowPurchaseNudge(false);
    };

    const onConfirmPurchase = () => {
        setIsModalVisible(true);
    };

    const onModalClose = () => {
        setIsModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Purchase items for your pets!</Text>
            {showPurchaseNudge ? (
                <View style={styles.optionsContainer}>
                    <View style={styles.optionsRow}>
                        <IconButton icon="chevron-back" label="Back" onPress={onReset} />
                        <CircleButton onPress={onConfirmPurchase} />
                    </View>
                </View>
            ) : (
                <View style={styles.footerContainer}>
                    <Button label="Adopt a Cat" onPress={() => setShowPurchaseNudge(true)} />
                    <Button label="Buy a toy" onPress={() => setIsModalVisible(true)}/>
                </View>

            )}
            <ToyPicker isVisible={isModalVisible} onClose={onModalClose}>
                <ToyList onSelect={setPickedToy} onCloseModal={onModalClose} />
            </ToyPicker>
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
    optionsContainer: {
        position: 'absolute',
        bottom: 80,
    },
    optionsRow: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    text: {
        color: '#fff',
    }
});