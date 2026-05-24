import { ImageSourcePropType, Text, View, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { useState, useLayoutEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';

import { useShopDbActions } from '../../src/hooks/useDbActions';
import { useShopPurchaseActions } from '../../src/hooks/useShopPurchaseActions';
import { Cat, Toy, Room, PurchasableItem } from '../../src/types/db';
import ItemList from '@/components/ItemList';
import ShopPopUp from '@/components/ShopPopUp';
import { imageSources } from '../../src/utils/imageMap';

export default function ShopScreen() {
    const { fetchCurrentCoinCount } = useShopDbActions();
    const { handlePurchase } = useShopPurchaseActions();

    const backgroundImage = require('../../assets/images/artwork/ShopBackground.png');

    const [coinCount, setCoinCount] = useState<number>(0);
    const [isToyModalVisible, setIsToyModalVisible] = useState<boolean>(false);
    const [isCatModalVisible, setIsCatModalVisible] = useState<boolean>(false);
    const [isRoomModalVisible, setIsRoomModalVisible] = useState<boolean>(false);

    const fetchCoinCount = useCallback(async () => {
        const count = await fetchCurrentCoinCount();
        setCoinCount(count);
    }, [fetchCurrentCoinCount]);

    useLayoutEffect(() => {
        fetchCoinCount();
    }, [fetchCoinCount]);

    const onPurchase = async (item: PurchasableItem) => {
        const success = await handlePurchase(item, coinCount);
        if (success) {
            onModalClose();
            await fetchCoinCount();
        }
    };

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
        <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
            <View style={styles.container}>
                <View style={styles.streetRow}>
                    <View style={styles.box}>
                        <TouchableOpacity onPress={() => setIsRoomModalVisible(true)}>
                            <Image source={require('../../assets/images/artwork/BuildARoom.png')} style={styles.background} resizeMode="contain" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.box}>
                        <TouchableOpacity onPress={() => setIsCatModalVisible(true)}>
                            <Image source={require('../../assets/images/artwork/AdoptACat.png')} style={styles.background} resizeMode="contain" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.box}>
                        <TouchableOpacity onPress={() => setIsToyModalVisible(true)}>
                            <Image source={require('../../assets/images/artwork/BuyAToy.png')} style={styles.background} resizeMode="contain" />
                        </TouchableOpacity>
                    </View>
                </View>
                <ShopPopUp isVisible={isToyModalVisible} onClose={onModalClose} title='Choose a toy'>
                    <ItemList<Toy>
                        itemType="buyable_toys"
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
                        itemType="buyable_cats"
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
                        itemType="buyable_rooms"
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
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    box: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
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
    streetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 100,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 20,
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