// example code for database interaction, needs heavy modification
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TextInput, Alert, StyleSheet } from 'react-native';

import { useDatabaseItems, UseLogbookDbActions } from '../../src/hooks/useDbActions';
import { ActiveCat, Activity } from '../../src/types/db';

export default function LogbookScreen() {
    const { items: activities } = useDatabaseItems<Activity>('activities');
    const { items: activeCats } = useDatabaseItems<ActiveCat>('active_cats');
    const { logActivity, logTransaction, updateCatStats } = UseLogbookDbActions();

    const handleActivityPress = async (activity: Activity) => {
        console.log(`Activity: ${activity.activity_name}`);
        console.log(`Happiness Effect: ${activity.happiness_effect}`);
        console.log(`Health Effect: ${activity.health_effect}`);
        console.log(`Coin Effect: ${activity.coin_effect}`);
        let availableHealthEffect = activity.health_effect;
        let availableHappinessEffect = activity.happiness_effect;
        let availableCoinEffect = activity.coin_effect;
        
        try {
            if (!activity.available) {
                Alert.alert('Activity Unavailable', 'This activity has already been completed today, and can only be logged once a day.');
                return;
            }
            // add happiness and health to cats, with excess turning into coins
            if (availableHealthEffect > 0) {
                let catsWithHealthBelow100 = activeCats.filter(cat => cat.health < 100);
                for (let cat of catsWithHealthBelow100) {
                    if (availableHealthEffect <= 0) {
                        break;
                    }
                    const healthEffectToApply = Math.min(availableHealthEffect, 100 - cat.health);
                    await updateCatStats(cat.active_cat_id, 'health', healthEffectToApply);
                    availableHealthEffect -= healthEffectToApply;
                }
                if (availableHealthEffect > 0) {
                    availableCoinEffect += 1;
                    availableHealthEffect = 0;
                }
            }
            if (availableHappinessEffect > 0) {
                let catsWithHappinessBelow100 = activeCats.filter(cat => cat.happiness < 100);
                for (let cat of catsWithHappinessBelow100) {
                    if (availableHappinessEffect <= 0) {
                        break;
                    }
                    const happinessEffectToApply = Math.min(availableHappinessEffect, 100 - cat.happiness);
                    await updateCatStats(cat.active_cat_id, 'happiness', happinessEffectToApply);
                    availableHappinessEffect -= happinessEffectToApply;
                }
                if (availableHappinessEffect > 0) {
                    availableCoinEffect += 1;
                    availableHappinessEffect = 0;
                }
            }
            // add coins to transaction history
            await logTransaction(availableCoinEffect);
            // add activity to activity log
            await logActivity(activity.activity_name);
            
            Alert.alert('Activity Completed', `You completed: ${activity.activity_name}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to log activity. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Activity Logbook</Text>
            <FlatList
                data={activities}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={{ marginVertical: 10 }}>
                        <Text style={styles.text}>{item.activity_name}</Text>
                        <Button title="Complete Activity" onPress={() => handleActivityPress(item)} />
                    </View>
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