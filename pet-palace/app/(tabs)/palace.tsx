import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, Dimensions, Image, ImageBackground } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from "expo-router";

import { useDatabaseItems } from '../../src/hooks/useDbActions';
import { ActiveCat, ActiveToy, ActiveRoom, RoomPosition } from '../../src/types/db';
import { imageSources } from '../../src/utils/imageMap';
import { useInitialCatCheck } from "@/src/hooks/useInitialCatCheck";

const { width } = Dimensions.get('window');
const backgroundImage = require('../../assets/images/artwork/PalaceBackground.png');

type ActiveCatWithDetails = ActiveCat & {
    _imageUrl?: any;
    position_x: number;
    position_y: number;
};
type ActiveToyWithDetails = ActiveToy & {
    _imageUrl?: any;
    position_x: number;
    position_y: number;
};

type ActiveRoomWithDetails = ActiveRoom & {
    cat?: ActiveCatWithDetails;
    toys: ActiveToyWithDetails[];
    _imageUrl?: any;
};

// build list of active rooms with their associated cats and toys
const useActiveRoomsWithDetails = (): ActiveRoomWithDetails[] => {
    const { items: activeCats } = useDatabaseItems<ActiveCat>('active_cats');
    const { items: activeToys } = useDatabaseItems<ActiveToy>('active_toys');
    const { items: activeRooms } = useDatabaseItems<ActiveRoom>('active_rooms');
    const { items: roomPositions } = useDatabaseItems<RoomPosition>('room_positions');

    // console.log('useActiveRoomsWithDetails: activeRooms count:', activeRooms.length);
    // console.log('useActiveRoomsWithDetails: activeRooms:', activeRooms);
    // console.log('useActiveRoomsWithDetails: activeCats count:', activeCats.length);
    console.log('useActiveRoomsWithDetails: activeCats:', activeCats);
    // console.log('useActiveRoomsWithDetails: activeToys count:', activeToys.length);
    console.log('useActiveRoomsWithDetails: activeToys:', activeToys);

    const roomsWithDetails = activeRooms.map(room => {
        const catInRoom = activeCats?.find(cat => cat.active_room_id === room.active_room_id);
        const toysForCat = catInRoom && activeToys ? activeToys.filter(toy => toy.active_cat_id === catInRoom.active_cat_id) : [];

        const catWithImageDetails: ActiveCatWithDetails | undefined = catInRoom ? {
            ...catInRoom,
            _imageUrl: imageSources[catInRoom.cat_name],
        } : undefined;

        const toysWithImageDetails: ActiveToyWithDetails[] = toysForCat.map(toy => ({
            ...toy,
            _imageUrl: imageSources[toy.toy_name],
        }));

        // update cat and toy positions based on available room_positions
        const positionsForRoom = roomPositions.filter(pos => pos.room_id === room.room_id);
        const usedPositionIds: number[] = [];
        if (catWithImageDetails && positionsForRoom.length > 0) {
            const randomPositionForCat = positionsForRoom[Math.floor(Math.random() * positionsForRoom.length)];
            catWithImageDetails.position_x = randomPositionForCat.position_x;
            catWithImageDetails.position_y = randomPositionForCat.position_y;
            usedPositionIds.push(randomPositionForCat.position_id);
        }
        toysWithImageDetails.forEach(toy => {
            const availablePositions = positionsForRoom.filter(pos => !usedPositionIds.includes(pos.position_id));
            if (availablePositions.length > 0) {
                const randomPositionForToy = availablePositions[Math.floor(Math.random() * availablePositions.length)];
                toy.position_x = randomPositionForToy.position_x;
                toy.position_y = randomPositionForToy.position_y;
                usedPositionIds.push(randomPositionForToy.position_id);
            }
        });

        return {
            ...room,
            cat: catWithImageDetails,
            toys: toysWithImageDetails,
            _imageUrl: imageSources[room.room_name],
        };
    });

  // console.log('useActiveRoomsWithDetails: roomsWithDetails count:', roomsWithDetails.length);
  // console.log('useActiveRoomsWithDetails: roomsWithDetails data:', roomsWithDetails); // Inspect the actual data

    return roomsWithDetails;
};

// Functional component for a single room item
const RoomItem = ({ item }: { item: ActiveRoomWithDetails }) => {
    const [roomImageDimensions, setRoomImageDimensions] = useState({ width: 0, height: 0 });

    let aspectRatio = 16 / 9;
    if (item._imageUrl) {
        const imageInfo = Image.resolveAssetSource(item._imageUrl);
        if (imageInfo && imageInfo.width && imageInfo.height) {
            aspectRatio = imageInfo.width / imageInfo.height;
        }
    }

    const CAT_SIZE_PERCENT = 0.20;
    const TOY_SIZE_PERCENT = 0.10;

    const renderChildItem = (child: ActiveCatWithDetails | ActiveToyWithDetails, isCat: boolean) => {
        if (!child || !child._imageUrl || !roomImageDimensions.width || !roomImageDimensions.height) {
            return null;
        }

        const sizePercent = isCat ? CAT_SIZE_PERCENT : TOY_SIZE_PERCENT;
        const itemWidth = roomImageDimensions.width * sizePercent;

        let itemHeight = itemWidth;
        const childImageInfo = Image.resolveAssetSource(child._imageUrl);
        if (childImageInfo && childImageInfo.width && childImageInfo.height) {
            itemHeight = itemWidth / (childImageInfo.width / childImageInfo.height);
        }

        const left = (child.position_x / 100) * roomImageDimensions.width - (itemWidth / 2);
        const top = (child.position_y / 100) * roomImageDimensions.height - (itemHeight);

        const clampedLeft = Math.max(0, Math.min(left, roomImageDimensions.width - itemWidth));
        const clampedTop = Math.max(0, Math.min(top, roomImageDimensions.height - itemHeight));

        const uniqueId = isCat 
            ? (child as ActiveCatWithDetails).active_cat_id 
            : (child as ActiveToyWithDetails).active_toy_id;

        return (
            <Image
                key={`${isCat ? 'cat' : 'toy'}-${uniqueId}`}
                source={child._imageUrl}
                style={[
                    styles.childItem,
                    {
                        width: itemWidth,
                        height: itemHeight,
                        left: clampedLeft,
                        top: clampedTop,
                    },
                ]}
                resizeMode="contain"
            />
        );
    };

    return (
        <View style={styles.roomContainer}>
            {item._imageUrl ? (
                <ImageBackground
                    source={item._imageUrl}
                    style={[styles.itemImage, { aspectRatio: aspectRatio, height: undefined }]}
                    resizeMode="contain"
                    onLayout={(event) => {
                        const { width, height } = event.nativeEvent.layout;
                        setRoomImageDimensions({ width, height });
                    }}
                >
                    {item.cat && renderChildItem(item.cat, true)}

                    {item.toys.map(toy => renderChildItem(toy, false))}

                </ImageBackground>
            ) : (
                <View style={[styles.itemImage, styles.noImageIcon, { aspectRatio: aspectRatio, height: undefined }]}>
                    <Text style={styles.noImageText}>No Image</Text>
                </View>
            )}

            <View style={styles.catInfoBox}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.catInfoText}>{item.cat?.cat_name}</Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Ionicons name="happy" size={styles.catInfoText.fontSize} color="gold" />
                    <Text style={styles.catInfoText}>{item.cat?.happiness}%  </Text>
                    <Ionicons name="heart" size={styles.catInfoText.fontSize} color="red" />
                    <Text style={styles.catInfoText}>{item.cat?.health}%</Text>
                </View>
            </View>
        </View>
    );
};

// Main screen component
export default function RoomsScreen() {
    const { showFirstTimeSplash, isCheckingCats, catCheckError } = useInitialCatCheck();
    const roomsWithDetails = useActiveRoomsWithDetails();

    if (isCheckingCats) {
        return (
            <View style={styles.container}>
                <Text>Loading application data...</Text>
            </View>
        );
    }

    if (catCheckError) {
        return (
            <View style={styles.container}>
                <Text style={{ color: 'red' }}>Error loading initial data: {catCheckError.message}</Text>
                <Text>Please restart the app or contact support.</Text>
            </View>
        );
    }

    return (
        <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">

            {showFirstTimeSplash && (
                <View style={styles.textSection}>
                    <Text style={styles.sectionTitle}>New to the app?</Text>
                    <Text style={styles.sectionContent}>
                        Looks like you don't have any cats yet. Want to go ahead and adopt your first cat?
                    </Text>
                    <Link href="./shop" style={styles.button}>
                        Go to Shop
                    </Link>
                </View>
            )}

            <FlatList
                data={roomsWithDetails}
                renderItem={({ item }) => <RoomItem item={item} />}
                keyExtractor={(item) => item.active_room_id.toString()}
                contentContainerStyle={styles.flatListContent}
                showsVerticalScrollIndicator={false}
            />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    flatListContent: {
        padding: '5%', // Padding around the entire list
        backgroundColor: '#fff', // White background for the screen
    },
    roomContainer: {
        marginBottom: 15, // Space between room blocks
        borderWidth: 2, // Outer border
        borderColor: 'black',
        padding: 4, // Space between outer and inner border
        borderRadius: 8, // Rounded corners for the entire room container
        overflow: 'hidden', // Ensures content respects borderRadius
    },
    catInfoBox: {
        backgroundColor: '#EAEAEA', // Light gray background
        borderColor: 'black',
        borderTopWidth: 1, // Add a border at the top to separate from image
        flexDirection: 'row',
        paddingVertical: 2,
        paddingHorizontal: 4,
        minHeight: 30, // Ensure a minimum height for the info box
    },
    catInfoText: {
        fontSize: 16,
        color: '#333',
    },
    itemImage: {
        width: '100%',
    },
    noImageIcon: {
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    childItem: {
        position: 'absolute',
    },
    textSection: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginVertical: 10,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        color: '#444',
    },
    sectionContent: {
        fontSize: 16,
        lineHeight: 24,
        color: '#666',
    },
    button: {
        fontSize: 20,
        textDecorationLine: 'underline',
        color: '#000'
    },
});