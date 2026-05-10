import { ImageSourcePropType, Text, View, StyleSheet, Alert, Pressable } from 'react-native';
import { useState, useLayoutEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';

import { useShopDbActions } from '../../src/hooks/useShopDbActions';
import { handlePurchase } from '../../src/hooks/useShopPurchaseActions';
import { Cat, Toy, Room, PurchasableItem } from '../../src/types/db';

import Button from '@/components/Button';
import CircleButton from '@/components/CircleButton';
import IconButton from '@/components/IconButton';
import ItemList from '@/components/ItemList';
import ShopPopUp from '@/components/ShopPopUp';
import Ionicons from '@expo/vector-icons/Ionicons';
import { imageSources } from '../../src/utils/imageMap';

export default function ShopScreen() {
    const navigation = useNavigation();
    const {
        fetchCurrentCoinCount
    } = useShopDbActions();

    const [coinCount, setCoinCount] = useState<number>(0);
    const [showPurchaseNudge, setShowPurchaseNudge] = useState<boolean>(false);
    const [isToyModalVisible, setIsToyModalVisible] = useState<boolean>(false);
    const [isCatModalVisible, setIsCatModalVisible] = useState<boolean>(false);
    const [isRoomModalVisible, setIsRoomModalVisible] = useState<boolean>(false);
    const [pickedToy, setPickedToy] = useState<ImageSourcePropType | undefined>(undefined);
    const [pickedCat, setPickedCat] = useState<ImageSourcePropType | undefined>(undefined);
    const [pickedRoom, setPickedRoom] = useState<ImageSourcePropType | undefined>(undefined);

    const fetchCoinCount = useCallback(async () => {
        const count = await fetchCurrentCoinCount();
        setCoinCount(count);
    }, [fetchCurrentCoinCount]);

    useLayoutEffect(() => {
        fetchCoinCount();
    }, [fetchCoinCount]);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Shop',
            headerShown: true,
            headerRight: () => (
                <View style={headerStyles.coinContainer}>
                    <Ionicons name="cash-outline" size={20} color="#FFD700" />
                    <Text style={headerStyles.coinText}>
                        {coinCount !== null ? coinCount.toLocaleString() : 'Loading...'}
                    </Text>
                </View>
            ),
            headerStyle: {
                backgroundColor: '#30363d',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 20,
            },
        });
    }, [navigation, coinCount]);

    const onPurchase = async (item: PurchasableItem) => {
        await handlePurchase(item);
        onModalClose();
        await fetchCoinCount();
    };

    const onReset = () => {
        setShowPurchaseNudge(false);
    };

    const onConfirmToyPurchase = () => {
        setIsToyModalVisible(true);
    };

    const onConfirmCatPurchase = () => {
        setIsCatModalVisible(true);
    };

    const onConfirmRoomPurchase = () => {
        setIsRoomModalVisible(true);
    }

    const onModalClose = () => {
        setIsToyModalVisible(false);
        setIsCatModalVisible(false);
        setIsRoomModalVisible(false);
    };

    const _getTypedImageUrl = <T extends Record<string, any>>(item: T, nameKey: keyof T & string): ImageSourcePropType | undefined => {
        const itemName = item[nameKey] as string;
        if (itemName && imageSources[itemName]) {
            return imageSources[itemName];
        }
        return undefined;
    };

    const getCatImageUrl = (cat: Cat): ImageSourcePropType | undefined => {
        return _getTypedImageUrl(cat, 'cat_name');
    };

    const getToyImageUrl = (toy: Toy): ImageSourcePropType | undefined => {
        return _getTypedImageUrl(toy, 'toy_name');
    };

    const getRoomImageUrl = (room: Room): ImageSourcePropType | undefined => {
        return _getTypedImageUrl(room, 'room_name');
    };

    const renderCatContent = (cat: Cat) => (
        <View>
            <Text style={styles.title}>Name: {cat.cat_name}</Text>
            <Text>Cost: ${cat.cat_cost}</Text>
            {cat.preferred_toy_name && <Text>Preferred Toy: {cat.preferred_toy_name}</Text>}
            {cat.preferred_room_name && <Text>Preferred Room: {cat.preferred_room_name}</Text>}
        </View>
    );

    const renderToyContent = (toy: Toy) => (
        <View>
            <Text style={styles.title}>Name: {toy.toy_name}</Text>
            <Text>Cost: ${toy.toy_cost}</Text>
            <Text>{toy.enrichment_type}: +{toy.enrichment_value}</Text>
        </View>
    );

    const renderRoomContent = (room: Room) => (
        <View>
            <Text style={styles.title}>Name: {room.room_name}</Text>
            <Text>Cost: ${room.room_cost}</Text>
            <Text>{room.enrichment_type}: +{room.enrichment_value}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Adopt cats, build rooms and purchase items for your pets!</Text>
            {showPurchaseNudge ? (
                <View style={styles.optionsContainer}>
                    <View style={styles.optionsRow}>
                        <IconButton icon="chevron-back" label="Back" onPress={onReset} />
                        <CircleButton onPress={onConfirmToyPurchase} />
                        <CircleButton onPress={onConfirmCatPurchase} />
                        <CircleButton onPress={onConfirmRoomPurchase} />
                    </View>
                </View>
            ) : (
                <View style={styles.footerContainer}>
                    <Button label="Adopt a Cat" onPress={() => setIsCatModalVisible(true)} />
                    <Button label="Buy a toy" onPress={() => setIsToyModalVisible(true)}/>
                    <Button label="Buy a room" onPress={() => setIsRoomModalVisible(true)} />
                </View>

            )}
            <ShopPopUp isVisible={isToyModalVisible} onClose={onModalClose} title='Choose a toy'>
                <ItemList<Toy>
                    itemType="toys"
                    idKey="toy_id"
                    actionButtonText="Buy"
                    emptyMessage="No toys available at the moment."
                    loadingMessage="Loading toys..."
                    onItemAction={onPurchase}
                    getImageUrl={getToyImageUrl}
                    renderItemContent={renderToyContent}
                />
            </ShopPopUp>
            <ShopPopUp isVisible={isCatModalVisible} onClose={onModalClose} title='Choose a cat'>
                <ItemList<Cat>
                    itemType="cats"
                    idKey="cat_id"
                    actionButtonText="Adopt"
                    emptyMessage="No adoptable cats found at the moment."
                    loadingMessage="Loading adoptable cats..."
                    onItemAction={onPurchase}
                    getImageUrl={getCatImageUrl}
                    renderItemContent={renderCatContent}
                />
            </ShopPopUp>
            <ShopPopUp isVisible={isRoomModalVisible} onClose={onModalClose} title='Choose a room'>
                <ItemList<Room>
                    itemType="rooms"
                    idKey="room_id"
                    actionButtonText="Buy"
                    emptyMessage="No rooms available at the moment."
                    loadingMessage="Loading rooms..."
                    onItemAction={onPurchase}
                    getImageUrl={getRoomImageUrl}
                    renderItemContent={renderRoomContent}
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

const headerStyles = StyleSheet.create({
    coinContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Slightly transparent background for the coin display
    },
    coinText: {
        color: '#FFD700', // Gold color for coin text
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
    },
});