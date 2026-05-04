import { useEffect, useState } from "react";
import { useDatabase } from "@/src/database/DatabaseContext";
import { fetch_all_adoptable_cats_info } from "@/src/database/databaseQueries";


interface AdoptableCatInfo {
    cat_id: number;
    cat_name: string;
    cat_cost: number;
    preferred_toy_id: number;
    preferred_room_id: number;
}

export function useAdoptableCatsCheck() {
    const { db, isLoading: isDbLoading, error: dbError } = useDatabase();
    const [isFetchingCats, setIsFetchingCats] = useState(true);
    const [catFetchError, setCatFetchError] = useState<Error | null>(null);
    const [adoptableCats, setAdoptableCats] = useState<AdoptableCatInfo[]>([]);

    useEffect(() => {
        const fetchAdoptableCatsData = async () => {
            setIsFetchingCats(true);
            setCatFetchError(null);
            setAdoptableCats([]);

            if (db && !isDbLoading && !dbError) {
            try {
                const result = await db.getAllAsync<AdoptableCatInfo>(fetch_all_adoptable_cats_info);
                setAdoptableCats(result);
            } catch (e) {
                console.error("Failed to fetch adoptable cats info:", e);
                setCatFetchError(e instanceof Error ? e : new Error(String(e)));
            } finally {
                setIsFetchingCats(false);
            }
            } else if (dbError) {
                console.error("Database error prevented cat fetch:", dbError);
                setCatFetchError(dbError);
                setIsFetchingCats(false);
            }
        };

        fetchAdoptableCatsData();
    }, [db, isDbLoading, dbError]);

    return { adoptableCats, isFetchingCats, catFetchError };
}