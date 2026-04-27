// src/hooks/useInitialCatCheck.js
import { useEffect, useState } from "react";
import { useDatabase } from "@/src/database/DatabaseContext";
import { fetch_active_cat_count } from "@/src/database/databaseQueries";

export function useInitialCatCheck() {
const { db, isLoading: isDbLoading, error: dbError } = useDatabase();
const [showFirstTimeSplash, setShowFirstTimeSplash] = useState(false);
const [isCheckingCats, setIsCheckingCats] = useState(true);
const [catCheckError, setCatCheckError] = useState<Error | null>(null);

useEffect(() => {
  const checkCatCount = async () => {
    if (!isDbLoading && db) {
      setIsCheckingCats(true);
      setCatCheckError(null);
      try {
        const result = await db.getFirstAsync(fetch_active_cat_count) as any;
        if (result && typeof result.count === 'number') {
          setShowFirstTimeSplash(result.count === 0);
        } else {
          setShowFirstTimeSplash(true);
        }
      } catch (e) {
        console.error("Failed to fetch active cat count:", e);
        setCatCheckError(e as Error);
        setShowFirstTimeSplash(true);
      } finally {
        setIsCheckingCats(false);
      }
    } else if (isDbLoading) {
      setIsCheckingCats(true);
      setShowFirstTimeSplash(false);
    } else if (dbError) {
      console.error("Database error prevented cat count check:", dbError);
      setCatCheckError(dbError);
      setIsCheckingCats(false);
      setShowFirstTimeSplash(true);
    }
  };

  checkCatCount();
}, [db, isDbLoading, dbError]);

return { showFirstTimeSplash, isCheckingCats, catCheckError };
}