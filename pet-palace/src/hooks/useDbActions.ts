import { useCallback, useEffect, useState } from 'react';
import { useDatabase } from '../database/DatabaseContext';
import {
    fetch_items,
    fetch_empty_active_rooms,
    fetch_coin_count,
    insert_item_into_active_cats,
    insert_item_into_active_toys,
    insert_item_into_active_rooms,
    insert_transaction,
    fetch_available_cats_for_toy
} from '../database/databaseQueries';
import { GenericDbItem } from '../types/db';

/**
* A generic hook to fetch items from a specified database table.
* @param itemType The type of the item, part of the database table name (e.g., 'buyable_cats', 'buyable_toys', 'buyable_rooms').
*                 This `itemType` should also correspond to the table name you want to refresh.
* @returns An object containing the fetched items, fetching state, any error, and a function to trigger refresh for this specific itemType.
*/
export function useDatabaseItems<T extends GenericDbItem>(itemType: string) {
    const { db, dbLoading, dbError, getRefreshKey, triggerRefresh: globalTriggerRefresh } = useDatabase();
    const [isFetching, setIsFetching] = useState(true);
    const [fetchError, setFetchError] = useState<Error | null>(null);
    const [items, setItems] = useState<T[]>([]);
    const tableRefreshKey = getRefreshKey(itemType);

    const triggerTableRefresh = useCallback(() => {
        globalTriggerRefresh(itemType);
    }, [globalTriggerRefresh, itemType]);

    useEffect(() => {
        const fetchItemsData = async () => {
            setIsFetching(true);
            setFetchError(null);
            setItems([]);

            if (db && !dbLoading && !dbError) {
                try {
                    const query = fetch_items[itemType];
                    if (!query) {
                        console.warn(`No fetch query defined for itemType: '${itemType}'. Skipping fetch.`);
                        setFetchError(new Error(`No fetch query defined for itemType: '${itemType}'`));
                        return;
                    }
                    const result = await db.getAllAsync<T>(query);
                    setItems(result);
                } catch (e) {
                    console.error(`Failed to fetch items from ${itemType} table:`, e);
                    setFetchError(e instanceof Error ? e : new Error(String(e)));
                } finally {
                    setIsFetching(false);
                }
            } else if (dbError) {
                console.error(`Database error prevented fetch from ${itemType} table:`, dbError);
                setFetchError(dbError);
                setIsFetching(false);
            }
        };

        fetchItemsData();
    }, [db, dbLoading, dbError, itemType, tableRefreshKey]);

    return { items, isFetching, fetchError, triggerRefresh: triggerTableRefresh };
}

export const useShopDbActions = () => {
    const { db, triggerRefresh } = useDatabase();

    const logTransaction = useCallback(async (transactionValue: number) => {
        if (!db) {
            console.warn("Database not initialized yet. Cannot log transaction.");
            throw new Error("Database not ready for transaction logging.");
        }
        try {
            await db.runAsync(insert_transaction, transactionValue, transactionValue);
            console.log(`Transaction logged: ${transactionValue}`);
            triggerRefresh('transaction_history');
        } catch (error) {
            console.error("Failed to log transaction:", error);
            throw error;
        }
    }, [db, triggerRefresh]);

    const insertItemIntoActiveCats = useCallback(async (itemId: number, chosenRoomId: number) => {
        if (!db) {
            console.warn("Database not initialized yet. Cannot insert item into active tables.");
            throw new Error("Database not ready for item insertion.");
        }
        try {
            const query = insert_item_into_active_cats;
            await db.runAsync(query, chosenRoomId, itemId);
            console.log(`Item (type: cats, ID: ${itemId}) inserted into active tables.`);
            triggerRefresh('active_cats');
        } catch (error) {
            console.error(`Failed to insert item ${itemId} into active tables for type cats:`, error);
            throw error;
        }
    }, [db, triggerRefresh]);

    const insertItemIntoActiveToys = useCallback(async (itemId: number, chosenCatId: number) => {
        if (!db) {
            console.warn("Database not initialized yet. Cannot insert item into active tables.");
            throw new Error("Database not ready for item insertion.");
        }
        try {
            const query = insert_item_into_active_toys;
            await db.runAsync(query, chosenCatId, itemId);
            console.log(`Item (type: toys, ID: ${itemId}) inserted into active tables.`);
            triggerRefresh('active_toys');
        } catch (error) {
            console.error(`Failed to insert item ${itemId} into active tables for type toys:`, error);
            throw error;
        }
    }, [db, triggerRefresh]);

    const insertItemIntoActiveRooms = useCallback(async (itemId: number) => {
        if (!db) {
            console.warn("Database not initialized yet. Cannot insert item into active tables.");
            throw new Error("Database not ready for item insertion.");
        }
        try {
            const query = insert_item_into_active_rooms;
            await db.runAsync(query, itemId);
            console.log(`Item (type: rooms, ID: ${itemId}) inserted into active tables.`);
            triggerRefresh('active_rooms');
        } catch (error) {
            console.error(`Failed to insert item ${itemId} into active tables for type rooms:`, error);
            throw error;
        }
    }, [db, triggerRefresh]);

    const fetchAvailableCatsForToy = useCallback(async (toyId: number): Promise<{ active_cat_id: number; cat_name: string }[]> => {
        if (!db) {
            console.warn("Database not initialized yet. Returning empty available cats list.");
            return [];
        }
        try {
            const result = await db.getAllAsync<{ active_cat_id: number; cat_name: string }>(fetch_available_cats_for_toy, toyId);
            return result;
        } catch (error) {
            console.error("Failed to fetch available cats for toy:", error);
            return [];
        }
    }, [db]);

    const fetchCurrentCoinCount = useCallback(async (): Promise<number> => {
        if (!db) {
            console.warn("Database not initialized yet. Returning 0 coins.");
            return 0;
        }
        try {
            const result = await db.getFirstAsync<{ coins: number }>(fetch_coin_count);
            if (result && typeof result.coins === 'number') {
                return result.coins;
            } else {
                return 0;
            }
        } catch (error) {
            console.error("Failed to fetch coin count:", error);
            return 0;
        }
    }, [db]);

    const fetchEmptyActiveRooms = useCallback(async (): Promise<{ active_room_id: number; room_name: string }[]> => {
        if (!db) {
            console.warn("Database not initialized yet. Returning empty active rooms list.");
            return [];
        }
        try {
            const result = await db.getAllAsync<{ active_room_id: number; room_name: string }>(fetch_empty_active_rooms);
            return result;
        } catch (error) {
            console.error("Failed to fetch empty active rooms:", error);
            return [];
        }
    }, [db]);

    return {
        logTransaction,
        insertItemIntoActiveCats,
        insertItemIntoActiveToys,
        insertItemIntoActiveRooms,
        fetchAvailableCatsForToy,
        fetchCurrentCoinCount,
        fetchEmptyActiveRooms,
    };
};