import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, ImageBackground } from 'react-native';


import { useDatabaseItems, UseLogbookDbActions } from '../../src/hooks/useDbActions';
import { ActiveCat, Activity } from '../../src/types/db';

export default function LogbookScreen() {
    const { items: activities } = useDatabaseItems<Activity>('activities');
    const { items: activeCats } = useDatabaseItems<ActiveCat>('active_cats');
    const { logActivity, logTransaction, updateCatStats } = UseLogbookDbActions();

    const backgroundImage = require('../../assets/images/artwork/PalaceBackground.png');
    const logbookImage = require('../../assets/images/artwork/LogbookPage.png');

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
        <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
            <View style={styles.container}>
                <ImageBackground source={logbookImage} style={styles.background} resizeMode="cover">
                    <Text style={styles.text}>Activity Logbook</Text>
                    <FlatList
                        data={activities}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={{ marginVertical: 10 }}>
                                <TouchableOpacity 
                                    style={[
                                        styles.button,
                                        item.available ? styles.buttonAvailable : styles.buttonUnavailable
                                    ]}
                                    onPress={() => handleActivityPress(item)}>
                                    <Text style={styles.buttonText}>{item.activity_name}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </ImageBackground>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityContainer: {
        marginVertical: 10,
        alignItems: 'center',
        width: 250,
        padding: 10,
    },
    text: {
        color: '#2f183b',
        marginBottom: 8,
        fontSize: 20,
        fontWeight: '600',
        paddingHorizontal: 10,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    buttonAvailable: {
        backgroundColor: '#715e88', // Your primary blue
    },
    buttonUnavailable: {
        backgroundColor: '#555555', // Greyed-out state
    },
    buttonText: {
        color: '#fff',
        fontWeight: '400',
    }
});