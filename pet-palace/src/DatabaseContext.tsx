import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SQLite from 'expo-sqlite';
import { initDatabase } from './database';

interface DatabaseContextType {
    db: SQLite.SQLiteDatabase | null;
    isLoading: boolean;
    error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const initializeDb = async () => {
            try {
                const database = await initDatabase();
                setDb(database);
            } catch (err: any) {
                console.error("Failed to initialize database:", err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };
        initializeDb();
    }, []);

    return (
        <DatabaseContext.Provider value={{ db, isLoading, error }}>
            {children}
        </DatabaseContext.Provider>
    );
};

export const useDatabase = (): DatabaseContextType => {
    const context = useContext(DatabaseContext);
    if (context === undefined) {
        throw new Error('useDatabase must be used within a DatabaseProvider');
    }
    return context;
};
