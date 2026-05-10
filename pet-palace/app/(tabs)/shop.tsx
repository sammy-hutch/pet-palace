import { ImageSourcePropType, Text, View, StyleSheet, Alert, Pressable } from 'react-native';
import { useState, useLayoutEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useDatabase } from '../../src/database/DatabaseContext';
import * as SQLite from 'expo-sqlite';
import { GenericDbItem } from '../../src/hooks/useDatabaseItems'
import { imageSources } from '../../src/utils/imageMap';
import { fetch_coin_count, insert_item_into_active, insert_transaction } from "@/src/database/databaseQueries";

import Button from '@/components/Button';
import CircleButton from '@/components/CircleButton';
import IconButton from '@/components/IconButton';
import ItemList from '@/components/ItemList';
import ShopPopUp from '@/components/ShopPopUp';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Cat extends GenericDbItem {
   cat_id: number;
   cat_name: string;
   cat_cost: number;
   preferred_toy_name: string;
   preferred_room_name: string;
}

interface Toy extends GenericDbItem {
   toy_id: number;
   toy_name: string;
   toy_cost: number;
   enrichment_type: string;
   enrichment_value: number;
}

interface Room extends GenericDbItem {
   room_id: number;
   room_name: string;
   room_cost: number;
   enrichment_type: string;
   enrichment_value: number;
}

type PurchasableItem = Cat | Toy | Room;

export default function ShopScreen() {
    const navigation = useNavigation();
    const { db } = useDatabase();

    const [coinCount, setCoinCount] = useState<number>(0);
    const [showPurchaseNudge, setShowPurchaseNudge] = useState<boolean>(false);
    const [isToyModalVisible, setIsToyModalVisible] = useState<boolean>(false);
    const [isCatModalVisible, setIsCatModalVisible] = useState<boolean>(false);
    const [isRoomModalVisible, setIsRoomModalVisible] = useState<boolean>(false);
    const [pickedToy, setPickedToy] = useState<ImageSourcePropType | undefined>(undefined);
    const [pickedCat, setPickedCat] = useState<ImageSourcePropType | undefined>(undefined);
    const [pickedRoom, setPickedRoom] = useState<ImageSourcePropType | undefined>(undefined);

    const logTransaction = useCallback(async (transactionValue: number) => {
        if (!db) {
            console.warn("Database not initialized yet.");
            return;
        }
        try {
            await db.runAsync(insert_transaction, transactionValue, transactionValue);
        } catch (error) {
            console.error("Failed to log transaction:", error);
        }
    }, [db]);
    
    const insertItemIntoActive = useCallback(async (itemType: string, itemId: number) => {
        if (!db) {
            console.warn("Database not initialized yet.");
            return;
        }
        try {
            await db.runAsync(insert_item_into_active[itemType], itemId);
        } catch (error) {
            console.error("Failed to insert item into active tables:", error);
        }
    }, [db]);

    const fetchCoinCount = useCallback(async () => {
        if (!db) {
            console.warn("Database not initialized yet.");
            return;
        }
        try {
            const result = await db.getFirstAsync<{ coins: number }>(fetch_coin_count);
            if (result && typeof result.coins === 'number') {
                setCoinCount(result.coins);
            } else {
                setCoinCount(0);
            }
        } catch (error) {
            console.error("Failed to fetch coin count:", error);
            setCoinCount(0);
        }
    }, [db]);

    useLayoutEffect(() => {
        fetchCoinCount();
    }, [fetchCoinCount]);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Shop', // Static title for the screen
            headerShown: true, // Ensure the header is shown for this tab
            headerRight: () => (
                <View style={headerStyles.coinContainer}>
                    <Ionicons name="cash-outline" size={20} color="#FFD700" />
                    <Text style={headerStyles.coinText}>
                        {coinCount !== null ? coinCount.toLocaleString() : 'Loading...'}
                    </Text>
                </View>
            ),
            // You can also customize header styles here if needed
            headerStyle: {
                backgroundColor: '#30363d', // Darker header background for contrast
            },
            headerTintColor: '#fff', // Color of title and icons
            headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 20,
            },
        });
    }, [navigation, coinCount]);

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
    
    const handlePurchase = async (item: PurchasableItem) => {
        let itemType: string;
        let itemId: number;
        let itemCost: number;

        if ('cat_id' in item) {
            itemType = 'cats';
            itemId = item.cat_id;
            itemCost = item.cat_cost;
        } else if ('toy_id' in item) {
            itemType = 'toys';
            itemId = item.toy_id;
            itemCost = item.toy_cost;
        } else if ('room_id' in item) {
            itemType = 'rooms';
            itemId = item.room_id;
            itemCost = item.room_cost;
        } else {
            console.error('Attempted to purchase an unknown item type:', item);
            Alert.alert('Error', 'Could not process purchase for this item.');
            return;
        }

        Alert.alert(`Purchase ${itemType}`, `You have initiated purchase for ${itemType} ID: ${itemId}`);
        await logTransaction(-itemCost);
        await insertItemIntoActive(itemType, itemId);
        onModalClose(); // Close the modal after purchase attempt

        await fetchCoinCount();
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
                    onItemAction={handlePurchase}
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
                    onItemAction={handlePurchase}
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
                    onItemAction={handlePurchase}
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