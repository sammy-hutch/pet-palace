import React from 'react';
import { FlatList, View, Text, ActivityIndicator, StyleSheet, Pressable, ImageSourcePropType, Image, TouchableOpacity, Alert } from 'react-native';
import { useAdoptableCatsCheck } from '../src/hooks/useAdoptableCatsCheck';



interface Cat {
    cat_id: number;
    cat_name: string;
    cat_cost: number;
    cat_image_url: string;
    // Add other properties as needed
}

interface CatListItemProps {
    cat: Cat;
    onPurchase: (catId: number) => void;
}

const CatListItem: React.FC<CatListItemProps> = ({ cat, onPurchase }) => {
    return (
        <View style={styles.item}>
            <Image source={{ uri: cat.cat_image_url }} style={styles.catImage} />

            <View style={styles.rightContent}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Name: {cat.cat_name}</Text>
                    <Text>ID: {cat.cat_id}</Text>
                    <Text>Cost: ${cat.cat_cost}</Text>
                    {/* Display other properties as needed */}
                </View>

                <TouchableOpacity 
                    style={styles.purchaseButton} 
                    onPress={() => onPurchase(cat.cat_id)}
                >
                    <Text style={styles.purchaseButtonText}>Purchase</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function CatList() {
    const { adoptableCats, isFetchingCats, catFetchError } = useAdoptableCatsCheck();

    const adoptableCatsWithImages = adoptableCats.map(cat => ({
        ...cat,
        cat_image_url: `https://placekitten.com/200/200?image=${cat.cat_id}` // Example image URL using placekitten
    }));

    const handlePurchase = (catId: number) => {
        Alert.alert('Purchase', `You have purchased cat with ID: ${catId}`);
    };

    if (isFetchingCats) {
    return (
        <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading adoptable cats...</Text>
        </View>
    );
    }

    if (catFetchError) {
    return (
        <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {catFetchError.message}</Text>
        </View>
    );
    }

    if (adoptableCats.length === 0) {
    return (
        <View style={styles.centered}>
        <Text>No adoptable cats found at the moment.</Text>
        </View>
    );
    }

    return (
    <FlatList
        data={adoptableCatsWithImages}
        keyExtractor={(item) => item.cat_id.toString()}
        renderItem={({ item }) => (
            <CatListItem cat={item} onPurchase={handlePurchase} />
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
catImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
    resizeMode: 'cover',
},
rightContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
},
textContainer: {
},
title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
},
purchaseButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'flex-end',
},
purchaseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
},
});