import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useDatabaseItems, useShopDbActions } from '../src/hooks/useDbActions';
import { ActiveCat } from '../src/types/db';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useDatabase } from '../src/database/DatabaseContext';

export default function HeaderStats() {
  const { items: activeCats, isFetching: catsLoading } = useDatabaseItems<ActiveCat>('active_cats');
  const { fetchCurrentCoinCount } = useShopDbActions();
  const { getRefreshKey } = useDatabase();
  
  const [coins, setCoins] = useState<number>(0);
  const transactionRefreshKey = getRefreshKey('transaction_history');

  // Fetch coins whenever transactions update
  useEffect(() => {
    const updateCoins = async () => {
      const coinCount = await fetchCurrentCoinCount();
      setCoins(coinCount);
    };
    updateCoins();
  }, [fetchCurrentCoinCount, transactionRefreshKey]);

  // Calculate Averages
  const totalCats = activeCats.length;
  const avgHealth = totalCats > 0 
    ? Math.round(activeCats.reduce((acc, cat) => acc + cat.health, 0) / totalCats) 
    : 0;
  const avgHappiness = totalCats > 0 
    ? Math.round(activeCats.reduce((acc, cat) => acc + cat.happiness, 0) / totalCats) 
    : 0;

  return (
      <View style={styles.headerContainer}>
          {/* Happiness Stat */}
          <View style={styles.statItem}>
              <Ionicons name="happy" size={18} color="#ffd33d" />
              <Text style={styles.statText}>{avgHappiness}%</Text>
          </View>

          {/* Health Stat */}
          <View style={styles.statItem}>
              <Ionicons name="heart" size={18} color="#ff4d4d" />
              <Text style={styles.statText}>{avgHealth}%</Text>
          </View>

          {/* Coins Stat */}
          <View style={styles.statItem}>
              <Ionicons name="cash-outline" size={18} color="#ffb300" />
              <Text style={styles.statText}>{coins}</Text>
          </View>
      </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    backgroundColor: '#25292e',
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 5,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});