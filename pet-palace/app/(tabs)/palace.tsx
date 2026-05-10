import React from 'react';
import { StyleSheet, View, Text, FlatList, Dimensions, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useDatabaseItems } from '../../src/hooks/useDbActions';
import { ActiveCat, ActiveToy, ActiveRoom } from '../../src/types/db';
import { imageSources } from '../../src/utils/imageMap';

const { width } = Dimensions.get('window');

// build list of active rooms with their associated cats and toys
const useActiveRoomsWithDetails = () => {
    const { items: activeCats } = useDatabaseItems<ActiveCat>('active_cats');
    const { items: activeToys } = useDatabaseItems<ActiveToy>('active_toys');
    const { items: activeRooms } = useDatabaseItems<ActiveRoom>('active_rooms');

    
    console.log('useActiveRoomsWithDetails: activeRooms count:', activeRooms.length);
    console.log('useActiveRoomsWithDetails: activeRooms:', activeRooms);
    console.log('useActiveRoomsWithDetails: activeCats count:', activeCats.length);
    console.log('useActiveRoomsWithDetails: activeCats:', activeCats);
    console.log('useActiveRoomsWithDetails: activeToys count:', activeToys.length);
    console.log('useActiveRoomsWithDetails: activeToys:', activeToys);

    const roomsWithDetails = activeRooms.map(room => {
        const catInRoom = activeCats.find(cat => cat.active_room_id === room.active_room_id);
        const toysForCat = activeToys.filter(toy => toy.active_cat_id === catInRoom?.active_cat_id);
        return {
            ...room,
            cat: catInRoom,
            toys: toysForCat,
            _imageUrl: imageSources[room.room_name],
        };
    });

    
    console.log('useActiveRoomsWithDetails: roomsWithDetails count:', roomsWithDetails.length);
    console.log('useActiveRoomsWithDetails: roomsWithDetails count:', roomsWithDetails.length);
    console.log('useActiveRoomsWithDetails: roomsWithDetails data:', roomsWithDetails); // Inspect the actual data

    return roomsWithDetails;
};

type ActiveRoomWithDetails = ReturnType<typeof useActiveRoomsWithDetails>[number];

// Functional component for a single room item
const RoomItem = ({ item }: { item: ActiveRoomWithDetails }) => {
  return (
    <View style={styles.roomContainer}>
        {item._imageUrl ? (
            <Image source={item._imageUrl} style={styles.itemImage} />
        ) : (
            <View style={[styles.itemImage, styles.noImageIcon]}>
                <Text style={styles.noImageText}>No Image</Text>
            </View>
        )}

      {/* Cat info box */}
      <View style={styles.catInfoBox}>
        <View style={[styles.catInfoBox, { flex: 1 }]}>
            <Text style={styles.catInfoText}>{item.cat?.cat_name}</Text>
        </View>
        <View style={[styles.catInfoBox, { flex: 1, justifyContent: 'flex-end' }]}>
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
    <FlatList
      data={roomsWithDetails}
      renderItem={({ item }) => <RoomItem item={item} />}
      keyExtractor={(item) => item.active_room_id.toString()}
      contentContainerStyle={styles.flatListContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  flatListContent: {
    padding: '5%', // Padding around the entire list
    backgroundColor: '#fff', // White background for the screen
  },
  roomContainer: {
    marginBottom: 5, // Space between room blocks
    borderWidth: 2, // Outer border
    borderColor: 'black',
    padding: 4, // Space between outer and inner border
  },
  roomImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // Background color set dynamically based on item.roomImagePlaceholderColor
  },
  roomImageText: {
    fontSize: 20,
    fontStyle: 'italic',
    color: '#333',
  },
  catInfoBox: {
    backgroundColor: '#EAEAEA', // Light gray background
    borderColor: 'black',
    flexDirection: 'row',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  catInfoText: {
    fontSize: 16,
    color: '#333',
  },
  itemImage: {
    width: '100%',
    height: width * 0.5,
    borderRadius: 8,
    marginRight: 15,
    resizeMode: 'cover',
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