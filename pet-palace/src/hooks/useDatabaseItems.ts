import { useEffect, useState } from "react";
import { useDatabase } from "@/src/database/DatabaseContext";
import { fetch_all_adoptable_cats_info } from "@/src/database/databaseQueries"; // TODO: Replace with query when created

export interface GenericDbItem {
   [key: string]: any;
}

/**
* A generic hook to fetch items from a specified database table.
* @param itemType The type of the item, part of the database table name (e.g., 'cats', 'toys', 'rooms').
* @returns An object containing the fetched items, fetching state, and any error.
*/
export function useDatabaseItems<T extends GenericDbItem>(itemType: string) {
   const { db, isLoading: isDbLoading, error: dbError } = useDatabase();
   const [isFetching, setIsFetching] = useState(true);
   const [fetchError, setFetchError] = useState<Error | null>(null);
   const [items, setItems] = useState<T[]>([]);

   useEffect(() => {
       const fetchItemsData = async () => {
           setIsFetching(true);
           setFetchError(null);
           setItems([]);

           if (db && !isDbLoading && !dbError) {
               try {
                   // TODO: update with correct query
                   const query = `SELECT * FROM ${itemType}`;
                   const result = await db.getAllAsync<T>(query);
                   setItems(result);
               } catch (e) {
                   console.error(`Failed to fetch items from ${itemType}:`, e);
                   setFetchError(e instanceof Error ? e : new Error(String(e)));
               } finally {
                   setIsFetching(false);
               }
           } else if (dbError) {
               console.error(`Database error prevented fetch from ${itemType}:`, dbError);
               setFetchError(dbError);
               setIsFetching(false);
           }
       };

       fetchItemsData();
   }, [db, isDbLoading, dbError, itemType]);

   return { items, isFetching, fetchError };
}