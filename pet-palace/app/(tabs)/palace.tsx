import React from 'react';
import { StyleSheet, View, Text, FlatList, Dimensions, Image, ImageBackground } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useDatabaseItems } from '../../src/hooks/useDbActions';
import { ActiveCat, ActiveToy, ActiveRoom } from '../../src/types/db';
import { imageSources } from '../../src/utils/imageMap';

const { width } = Dimensions.get('window');
const backgroundImage = require('../../assets/images/artwork/PalaceBackground.png');

// build list of active rooms with their associated cats and toys
const useActiveRoomsWithDetails = () => {
  const { items: activeCats } = useDatabaseItems<ActiveCat>('active_cats');
  const { items: activeToys } = useDatabaseItems<ActiveToy>('active_toys');
  const { items: activeRooms } = useDatabaseItems<ActiveRoom>('active_rooms');

  // console.log('useActiveRoomsWithDetails: activeRooms count:', activeRooms.length);
  // console.log('useActiveRoomsWithDetails: activeRooms:', activeRooms);
  // console.log('useActiveRoomsWithDetails: activeCats count:', activeCats.length);
  // console.log('useActiveRoomsWithDetails: activeCats:', activeCats);
  // console.log('useActiveRoomsWithDetails: activeToys count:', activeToys.length);
  // console.log('useActiveRoomsWithDetails: activeToys:', activeToys);

  const roomsWithDetails = activeRooms.map(room => {
      // Ensure activeCats is not null before finding
      const catInRoom = activeCats?.find(cat => cat.active_room_id === room.active_room_id);
      // Ensure activeToys is not null and catInRoom exists before filtering
      const toysForCat = catInRoom && activeToys ? activeToys.filter(toy => toy.active_cat_id === catInRoom.active_cat_id) : [];
      return {
          ...room,
          cat: catInRoom,
          toys: toysForCat,
          _imageUrl: imageSources[room.room_name],
      };
  });

  // console.log('useActiveRoomsWithDetails: roomsWithDetails count:', roomsWithDetails.length);
  // console.log('useActiveRoomsWithDetails: roomsWithDetails data:', roomsWithDetails); // Inspect the actual data

  return roomsWithDetails;
};

type ActiveRoomWithDetails = ReturnType<typeof useActiveRoomsWithDetails>[number];

// Functional component for a single room item
const RoomItem = ({ item }: { item: ActiveRoomWithDetails }) => {
    // Dynamically calculate aspect ratio for local images
    let aspectRatio = 16 / 9; // Default aspect ratio for placeholder or if image info isn't available
    if (item._imageUrl) {
        const imageInfo = Image.resolveAssetSource(item._imageUrl);
        if (imageInfo && imageInfo.width && imageInfo.height) {
            aspectRatio = imageInfo.width / imageInfo.height;
        }
    }

    return (
    <View style={styles.roomContainer}>
        {item._imageUrl ? (
            <Image
                source={item._imageUrl}
                style={[styles.itemImage, { aspectRatio: aspectRatio, height: undefined }]}
                resizeMode="contain" // Ensures the whole image is visible without cropping
            />
        ) : (
            <View style={[styles.itemImage, styles.noImageIcon, { aspectRatio: aspectRatio, height: undefined }]}>
                <Text style={styles.noImageText}>No Image</Text>
            </View>
        )}

        {/* Cat info box */}
        <View style={styles.catInfoBox}>
        {/* Left side: Cat Name */}
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.catInfoText}>{item.cat?.cat_name}</Text>
        </View>
        {/* Right side: Happiness and Health */}
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Ionicons name="happy-outline" size={styles.catInfoText.fontSize} color="gold" />
            <Text style={styles.catInfoText}>{item.cat?.happiness}  </Text>
            <Ionicons name="heart" size={styles.catInfoText.fontSize} color="red" />
            <Text style={styles.catInfoText}>{item.cat?.health}</Text>
        </View>
        </View>
    </View>
    );
};

// Main screen component
export default function RoomsScreen() {
    const roomsWithDetails = useActiveRoomsWithDetails();
    return (
        <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
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
    // `height` is now controlled by `aspectRatio` in the component,
    // so we set height to `undefined` here to let `aspectRatio` take precedence.
    // borderRadius is applied to the container, so individual items don't need it if overflow: 'hidden' is set on container
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
});