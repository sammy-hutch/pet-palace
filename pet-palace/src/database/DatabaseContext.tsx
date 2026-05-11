import React, { createContext, ReactNode, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import * as SQLite from 'expo-sqlite';
import { Text } from 'react-native';
import { initDatabase } from './database';

interface DatabaseContextType {
    db: SQLite.SQLiteDatabase | null;
    dbLoading: boolean;
    dbError: Error | null;
    executeSql: <T>(sql: string, params?: any[]) => Promise<T[] | SQLite.SQLiteRunResult>;
    query: <T>(sql: string, params?: any[]) => Promise<T[]>;
    getRefreshKey: (tableName: string) => number;
    triggerRefresh: (tableName?: string) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
    const [dbLoading, setDbLoading] = useState(true);
    const [dbError, setDbError] = useState<Error | null>(null);
    const [refreshKeys, setRefreshKeys] = useState<Record<string, number>>({});

    const getRefreshKey = useCallback((tableName: string) => {
        return refreshKeys[tableName] || 0;
    }, [refreshKeys]);

    const triggerRefresh = useCallback((tableName?: string) => {
        setRefreshKeys(prevKeys => {
            const newKeys = { ...prevKeys };
            if (tableName) {
                newKeys[tableName] = (newKeys[tableName] || 0) + 1;
            } else {
                for (const key in newKeys) {
                    newKeys[key]++;
                }
            }
            return newKeys;
        });
    }, []);

    useEffect(() => {
        const initializeDatabase = async () => {
            try {
                const database = await initDatabase();
                setDb(database);
            } catch (err) {
                console.error("Error opening or initializing database:", err);
                setDbError(err as Error);
            } finally {
                setDbLoading(false);
            }
        };

        initializeDatabase();
    }, []);

    const executeSql = useCallback(async <T,>(sql: string, params: any[] = []): Promise<T[] | SQLite.SQLiteRunResult> => {
        if (!db) {
            throw new Error("Database not initialized for executeSql.");
        }
        try {
            const result = await db.runAsync(sql, params);
            return result;
        } catch (error) {
            console.error("Error executing SQL:", sql, params, error);
            throw error;
        }
    }, [db]);

    const query = useCallback(async <T,>(sql: string, params: any[] = []): Promise<T[]> => {
        if (!db) {
            throw new Error("Database not initialized for query.");
        }
        try {
            const result = await db.getAllAsync(sql, params);
            return result as T[];
        } catch (error) {
            console.error("Error querying SQL:", sql, params, error);
            throw error;
        }
    }, [db]);

    const contextValue = useMemo(() => ({
        db,
        dbLoading,
        dbError,
        executeSql,
        query,
        getRefreshKey,
        triggerRefresh,
    }), [db, dbLoading, dbError, executeSql, query, getRefreshKey, triggerRefresh]);

    if (dbLoading) {
        return <Text>Loading Database...</Text>;
    }
    if (dbError) {
        return <Text>Error: {dbError.message}</Text>;
    }

    return (
        <DatabaseContext.Provider value={contextValue}>
            {children}
        </DatabaseContext.Provider>
    );
};

export const useDatabase = () => {
    const context = useContext(DatabaseContext);
    if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
    }
    return context;
};