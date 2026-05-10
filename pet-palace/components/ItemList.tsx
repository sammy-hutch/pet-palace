import React from 'react';
import { FlatList, View, Text, ActivityIndicator, StyleSheet, Image, TouchableOpacity, Alert, ImageSourcePropType } from 'react-native';
import { useDatabaseItems } from '../src/hooks/useDbActions';
import { GenericDbItem } from '../src/types/db';

interface ItemListProps<T extends GenericDbItem> {
   itemType: string; // The item type, part of database table name (e.g., 'cats', 'toys', 'rooms')
   idKey: keyof T; // The name of the ID property (e.g., 'cat_id', 'toy_id')
   actionButtonText: string; // Text for the button (e.g., "Purchase", "Adopt", "View")
   emptyMessage: string; // Message to display when no items are found
   loadingMessage: string; // Message to display while loading
   onItemAction: (item: T) => void; // Callback for when the action button is pressed

   getImageUrl: (item: T) => ImageSourcePropType | undefined; // Function to get image URL for an item

   renderItemContent: (item: T) => React.ReactNode;
}

export default function ItemList<T extends GenericDbItem>({
   itemType,
   idKey,
   actionButtonText,
   emptyMessage,
   loadingMessage,
   onItemAction,
   getImageUrl,
   renderItemContent,
}: ItemListProps<T>) {
   const { items, isFetching, fetchError } = useDatabaseItems<T>(itemType);

   const itemsWithImages = items.map(item => ({
       ...item,
       _imageUrl: getImageUrl(item),
   }));

   const handleItemActionPress = (item: T) => {
       const itemId = item[idKey];
       if (typeof itemId === 'number' || typeof itemId === 'string') {
           onItemAction(item);
       } else {
           console.warn(`Item ID for key '${String(idKey)}' is not a number or string:`, itemId);
           Alert.alert('Error', 'Could not perform action: Invalid item ID.');
       }
   };

   if (isFetching) {
       return (
           <View style={styles.centered}>
               <ActivityIndicator size="large" color="#0000ff" />
               <Text>{loadingMessage}</Text>
           </View>
       );
   }

   if (fetchError) {
       return (
           <View style={styles.centered}>
               <Text style={styles.errorText}>Error: {fetchError.message}</Text>
           </View>
       );
   }

   if (items.length === 0) {
       return (
           <View style={styles.centered}>
               <Text>{emptyMessage}</Text>
           </View>
       );
   }

   return (
       <FlatList
           data={itemsWithImages}
           keyExtractor={(item) => String(item[idKey])}
           renderItem={({ item }) => (
               <View style={styles.item}>
                   {item._imageUrl ? (
                       <Image source={item._imageUrl} style={styles.itemImage} />
                   ) : (
                       <View style={[styles.itemImage, styles.noImageIcon]}>
                           <Text style={styles.noImageText}>No Image</Text>
                       </View>
                   )}

                   <View style={styles.rightContent}>
                       <View style={styles.textContainer}>
                           {renderItemContent(item)}
                       </View>

                       <TouchableOpacity
                           style={styles.actionButton}
                           onPress={() => handleItemActionPress(item)}
                       >
                           <Text style={styles.actionButtonText}>{actionButtonText}</Text>
                       </TouchableOpacity>
                   </View>
               </View>
           )}
           contentContainerStyle={styles.listContainer}
       />
   );
}

const styles = StyleSheet.create({
   centered: {
       flex: 1,
       justifyContent: 'center',
       alignItems: 'center',
   },
   listContainer: {
       paddingVertical: 10,
   },
   errorText: {
       color: 'red',
       fontSize: 16,
   },
   item: {
       flexDirection: 'row',
       backgroundColor: '#f9f9f9',
       padding: 15,
       marginVertical: 8,
       marginHorizontal: 16,
       borderRadius: 10,
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 2 },
       shadowOpacity: 0.1,
       shadowRadius: 3.84,
       elevation: 5,
       alignItems: 'center',
   },
   itemImage: {
       width: 100,
       height: 100,
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
   rightContent: {
       flex: 1,
       flexDirection: 'column',
       justifyContent: 'space-between',
   },
   textContainer: {
   },
   actionButton: {
       backgroundColor: '#4CAF50',
       paddingVertical: 10,
       paddingHorizontal: 15,
       borderRadius: 5,
       marginTop: 10,
       alignSelf: 'flex-end',
   },
   actionButtonText: {
       color: 'white',
       fontWeight: 'bold',
       fontSize: 14,
   },
});