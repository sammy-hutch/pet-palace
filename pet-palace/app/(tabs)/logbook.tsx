// example code for database interaction, needs heavy modification
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TextInput, Alert, StyleSheet } from 'react-native';
import { useDatabase } from '@/src/DatabaseContext'; // Adjust path as needed
import * as SQLite from 'expo-sqlite';

interface Item {
    id: number;
    name: string;
    quantity: number;
}

export default function LogbookScreen() {
    const { db, isLoading, error } = useDatabase();
    const [items, setItems] = useState<Item[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState('');

    const fetchItems = async (database: SQLite.SQLiteDatabase) => {
        try {
            const result = await database.getAllAsync<Item>('SELECT * FROM items');
            setItems(result);
        } catch (e) {
            console.error("Failed to fetch items:", e);
            Alert.alert("Error", "Failed to load items.");
        }
    };

    useEffect(() => {
        if (!isLoading && db) {
            fetchItems(db);
        }
    }, [db, isLoading]);

    const addItem = async () => {
        if (!db) return;
        if (!newItemName.trim() || !newItemQuantity.trim()) {
            Alert.alert("Error", "Please enter both name and quantity.");
            return;
        }
        const quantityNum = parseInt(newItemQuantity, 10);
        if (isNaN(quantityNum)) {
            Alert.alert("Error", "Quantity must be a number.");
            return;
        }

        try {
            await db.runAsync('INSERT INTO items (name, quantity) VALUES (?, ?)', newItemName, quantityNum);
            setNewItemName('');
            setNewItemQuantity('');
            fetchItems(db); // Re-fetch items to update the list
        } catch (e) {
            console.error("Failed to add item:", e);
            Alert.alert("Error", "Failed to add item.");
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading database...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Error loading database: {error.message}</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Logbook</Text>

            <TextInput
                placeholder="Item Name"
                value={newItemName}
                onChangeText={setNewItemName}
                style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
            />
            <TextInput
                placeholder="Quantity"
                value={newItemQuantity}
                onChangeText={setNewItemQuantity}
                keyboardType="numeric"
                style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
            />
            <Button title="Add Item" onPress={addItem} />

            <Text style={{ fontSize: 20, marginTop: 30, marginBottom: 10 }}>Items:</Text>
            <FlatList
                data={items}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Text>{item.name} (x{item.quantity})</Text>
                )}
            />
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
    text: {
        color: '#fff',
    }
});