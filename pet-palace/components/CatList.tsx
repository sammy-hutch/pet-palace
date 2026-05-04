import React from 'react';
import { FlatList, View, Text, ActivityIndicator, StyleSheet, Pressable, ImageSourcePropType } from 'react-native';
import { useAdoptableCatsCheck } from '../src/hooks/useAdoptableCatsCheck';

type CatListItemProps = {
    cat: {
        cat_name: string;
        cat_id: number;
        cat_cost: number;
        // add other cat properties as needed
    };
};

const CatListItem = ({ cat }: CatListItemProps) => (
    <View style={styles.item}>
    <Text style={styles.title}>Name: {cat.cat_name}</Text>
    <Text>ID: {cat.cat_id}</Text>
    <Text>Cost: ${cat.cat_cost}</Text>
    {/* Display other properties as needed */}
    </View>
);

// type Props = {
//     onSelect: (image: ImageSourcePropType) => void;
//     onCloseModal: () => void;
// };

export default function CatList(/*{ onSelect, onCloseModal }: Props*/) {
    const { adoptableCats, isFetchingCats, catFetchError } = useAdoptableCatsCheck();

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
        data={adoptableCats}
        keyExtractor={(item) => item.cat_id.toString()}
        renderItem={({ item }) => (
            /*<Pressable
                onPress={() => {
                    onSelect(item);
                    onCloseModal();
                }}>*/
                <CatListItem cat={item} />
            /*</Pressable>*/
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
item: {
  backgroundColor: '#f9f9f9',
  padding: 20,
  marginVertical: 8,
  marginHorizontal: 16,
  borderRadius: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 1.41,
  elevation: 2,
},
title: {
  fontSize: 18,
  fontWeight: 'bold',
},
errorText: {
  color: 'red',
  fontSize: 16,
},
});