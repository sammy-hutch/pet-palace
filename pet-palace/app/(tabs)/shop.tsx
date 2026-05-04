import { ImageSourcePropType, Text, View, StyleSheet } from 'react-native';
import { useState} from 'react';
import { useDatabase } from '../../src/database/DatabaseContext';
import * as SQLite from 'expo-sqlite';

import Button from '@/components/Button';
import CircleButton from '@/components/CircleButton';
import IconButton from '@/components/IconButton';
import ToyList from '@/components/ToyList';
import ToyPicker from '@/components/ToyPicker';
import CatList from '@/components/CatList';
import CatPicker from '@/components/CatPicker';

export default function ShopScreen() {
    const [showPurchaseNudge, setShowPurchaseNudge] = useState<boolean>(false);
    const [isToyModalVisible, setIsToyModalVisible] = useState<boolean>(false);
    const [isCatModalVisible, setIsCatModalVisible] = useState<boolean>(false);
    const [pickedToy, setPickedToy] = useState<ImageSourcePropType | undefined>(undefined);
    const [pickedCat, setPickedCat] = useState<ImageSourcePropType | undefined>(undefined);

    const onReset = () => {
        setShowPurchaseNudge(false);
    };

    const onConfirmToyPurchase = () => {
        setIsToyModalVisible(true);
    };

    const onConfirmCatPurchase = () => {
        setIsCatModalVisible(true);
    };

    const onModalClose = () => {
        setIsToyModalVisible(false);
        setIsCatModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Purchase items for your pets!</Text>
            {showPurchaseNudge ? (
                <View style={styles.optionsContainer}>
                    <View style={styles.optionsRow}>
                        <IconButton icon="chevron-back" label="Back" onPress={onReset} />
                        <CircleButton onPress={onConfirmToyPurchase} />
                        <CircleButton onPress={onConfirmCatPurchase} />
                    </View>
                </View>
            ) : (
                <View style={styles.footerContainer}>
                    <Button label="Adopt a Cat" onPress={() => setIsCatModalVisible(true)} />
                    <Button label="Buy a toy" onPress={() => setIsToyModalVisible(true)}/>
                </View>

            )}
            <ToyPicker isVisible={isToyModalVisible} onClose={onModalClose}>
                <ToyList onSelect={setPickedToy} onCloseModal={onModalClose} />
            </ToyPicker>
            <CatPicker isVisible={isCatModalVisible} onClose={onModalClose}>
                <CatList />
            </CatPicker>
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