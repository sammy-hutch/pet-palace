import { ImageSourcePropType, Text, View, StyleSheet, Alert } from 'react-native';
import { useState} from 'react';
import { useDatabase } from '../../src/database/DatabaseContext';
import * as SQLite from 'expo-sqlite';
import { GenericDbItem } from '../../src/hooks/useDatabaseItems'

import Button from '@/components/Button';
import CircleButton from '@/components/CircleButton';
import IconButton from '@/components/IconButton';
import ToyList from '@/components/ToyList';
import ItemList from '@/components/ItemList';
import ShopPopUp from '@/components/ShopPopUp';

interface Cat extends GenericDbItem {
   cat_id: number;
   cat_name: string;
   cat_cost: number;
   // Add other cat-specific properties from your database table
   preferred_toy_id?: number;
   preferred_room_id?: number;
}

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
    
    const handlePurchaseCat = (catId: number | string) => {
       Alert.alert('Purchase Cat', `You have initiated purchase for Cat ID: ${catId}`);
       // In a real app, you'd integrate with payment processing, inventory updates, etc.
    };

    const getCatImageUrl = (cat: Cat): string => {
       return `assets/images/cats/${cat.cat_name}.png`;
    };

    const renderCatContent = (cat: Cat) => (
       <View>
           <Text style={styles.title}>Name: {cat.cat_name}</Text>
           <Text>ID: {cat.cat_id}</Text>
           <Text>Cost: ${cat.cat_cost}</Text>
           {cat.preferred_toy_id && <Text>Prefers Toy ID: {cat.preferred_toy_id}</Text>}
           {/* Add other cat-specific details here */}
       </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Adopt cats and purchase items for your pets!</Text>
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
            <ShopPopUp isVisible={isToyModalVisible} onClose={onModalClose} title='Choose a toy'>
                <ToyList onSelect={setPickedToy} onCloseModal={onModalClose} />
            </ShopPopUp>
            <ShopPopUp isVisible={isCatModalVisible} onClose={onModalClose} title='Choose a cat'>
                <ItemList<Cat>
                    itemType="cats" // Your actual table name for cats
                    idKey="cat_id"
                    actionButtonText="Adopt"
                    emptyMessage="No adoptable cats found at the moment."
                    loadingMessage="Loading adoptable cats..."
                    onItemAction={handlePurchaseCat}
                    getImageUrl={getCatImageUrl}
                    renderItemContent={renderCatContent}
                />
            </ShopPopUp>
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
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
});