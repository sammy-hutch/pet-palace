import { Alert } from 'react-native';

import { useShopDbActions } from '../../src/hooks/useShopDbActions';
import { PurchasableItem } from '../../src/types/db';

const { 
    logTransaction, 
    insertItemIntoActiveCats, 
    insertItemIntoActiveToys,
    insertItemIntoActiveRooms,
    fetchAvailableCatsForToy, 
    fetchCurrentCoinCount, 
    fetchEmptyActiveRooms 
} = useShopDbActions();

const executePurchaseFlow = async (
    itemType: string,
    itemId: number,
    itemCost: number,
    itemName: string,
    action: string,
    action_past_tense: string,
    chosenRoomId?: number, // Optional for cats
    chosenCatId?: number   // Optional for toys
    ) => {
        Alert.alert(
            `Confirm Purchase`,
            `Are you sure you want to ${action} ${itemName} for $${itemCost}?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                    onPress: () => console.log("Final purchase confirmation cancelled.")
                },
                {
                    text: "Confirm",
                    onPress: async () => {
                        try {
                            if (itemType === 'cats' && chosenRoomId === undefined) {
                                Alert.alert('Error', 'No room selected for cat adoption. Please try again.');
                                return;
                            }
                            if (itemType === 'toys' && chosenCatId === undefined) {
                                Alert.alert('Error', 'No cat selected for toy purchase. Please try again.');
                                return;
                            }

                            await logTransaction(-itemCost);

                            if (itemType === 'cats') {
                                await insertItemIntoActiveCats(itemId, chosenRoomId!);
                            } else if (itemType === 'toys') {
                                await insertItemIntoActiveToys(itemId, chosenCatId!);
                            } else if (itemType === 'rooms') {
                                await insertItemIntoActiveRooms(itemId);
                            }

                            Alert.alert("Success", `${itemName} ${action_past_tense}ed successfully!`);
                        } catch (error) {
                            console.error("Purchase failed:", error);
                            Alert.alert("Purchase Failed", `There was an error processing your purchase for ${itemName}.`);
                        }
                    }
                }
            ]
        );
    };

export const handlePurchase = async (item: PurchasableItem) => {
    let itemType: string;
    let itemId: number;
    let itemCost: number;
    let itemName: string;
    let action: string = 'buy';
    let action_past_tense: string = 'bought';

    // --- 1. Determine Item Type and Details ---
    if ('cat_id' in item) {
        itemType = 'cats';
        itemId = item.cat_id;
        itemCost = item.cat_cost;
        itemName = item.cat_name;
        action = 'adopt';
        action_past_tense = 'adopted';
    } else if ('toy_id' in item) {
        itemType = 'toys';
        itemId = item.toy_id;
        itemCost = item.toy_cost;
        itemName = item.toy_name;
    } else if ('room_id' in item) {
        itemType = 'rooms';
        itemId = item.room_id;
        itemCost = item.room_cost;
        itemName = item.room_name;
        action = 'build';
        action_past_tense = 'built';
    } else {
        console.error('Attempted to purchase an unknown item type:', item);
        Alert.alert('Error', 'Could not process purchase for this item: Unknown type.');
        return;
    }

    // --- 2. Handle Item-Specific Selections and Chaining Alerts ---
    if (itemType === 'cats') {
        const emptyActiveRooms = await fetchEmptyActiveRooms();
        if (emptyActiveRooms.length === 0) {
            Alert.alert('No Available Rooms', 'You need to have at least one empty room available to adopt a cat. Please purchase a room first.');
            return;
        }

        Alert.alert(
            'Choose a Room',
            'Please choose an empty room for your new cat:',
            [
                ...emptyActiveRooms.map(room => ({
                    text: room.room_name,
                    onPress: () => {
                        executePurchaseFlow(itemType, itemId, itemCost, itemName, action, action_past_tense, room.active_room_id, undefined);
                    }
                })),
                {
                    text: "Cancel",
                    style: "cancel",
                    onPress: () => console.log("Cat adoption cancelled at room selection.")
                }
            ]
        );
    } else if (itemType === 'toys') {
        const availableCats = await fetchAvailableCatsForToy(itemId);
        if (availableCats.length === 0) {
            Alert.alert('No Available Cats', 'All your cats are currently playing with this toy. Please choose a different toy or wait until one of your cats is available.');
            return;
        }

        Alert.alert(
            'Choose a Cat',
            'Please choose a cat to play with this toy:',
            [
                ...availableCats.map(cat => ({
                    text: cat.cat_name,
                    onPress: () => {
                        executePurchaseFlow(itemType, itemId, itemCost, itemName, action, action_past_tense, undefined, cat.active_cat_id);
                    }
                })),
                {
                    text: "Cancel",
                    style: "cancel",
                    onPress: () => console.log("Toy purchase cancelled at cat selection.")
                }
            ]
        );
    } else {
        executePurchaseFlow(itemType, itemId, itemCost, itemName, action, action_past_tense, undefined, undefined);
    }
};