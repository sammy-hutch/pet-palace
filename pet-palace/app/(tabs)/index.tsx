import { Text, View, StyleSheet, ScrollView } from "react-native";
import { Link } from "expo-router";
import { useInitialCatCheck } from "@/src/hooks/useInitialCatCheck";

export default function Index() {
  const { showFirstTimeSplash, isCheckingCats, catCheckError } = useInitialCatCheck();

  if (isCheckingCats) {
    return (
      <View style={styles.container}>
        <Text>Loading application data...</Text>
      </View>
    );
  }

  if (catCheckError) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red' }}>Error loading initial data: {catCheckError.message}</Text>
        <Text>Please restart the app or contact support.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={styles.headerText}>Welcome to Pet Palace!</Text>

        <View style={styles.textSection}>
          <Text style={styles.sectionTitle}>Welcome to Pet Palace, the productivity app where you look after cats!</Text>
          <Text style={styles.sectionContent}>
            Earn cat coins by logging productivity tasks, and spend them on new cats, toys, and rooms.
          </Text>
        </View>

        {showFirstTimeSplash && (
          <View style={styles.textSection}>
            <Text style={styles.sectionTitle}>New to the app?</Text>
            <Text style={styles.sectionContent}>
              Looks like you don't have any cats yet. Want to go ahead and adopt your first cat?
            </Text>
            <Link href="./shop" style={styles.button}>
              Go to Shop
            </Link>
          </View>
        )}

        <View style={styles.textSection}>
          <Text style={styles.sectionTitle}>Get Started</Text>
          <Text style={styles.sectionContent}>
            Check out your adopted cats in the palace:
          </Text>
          <Link href="./palace" style={styles.button}>
            Go to Palace
          </Link>
          <Text style={styles.sectionContent}>
            Log your productivity in the logbook:
          </Text>
          <Link href="./logbook" style={styles.button}>
            Go to Logbook
          </Link>
          <Text style={styles.sectionContent}>
            Adopt more cats and purchase toys and rooms in the shop:
          </Text>
          <Link href="./shop" style={styles.button}>
            Go to Shop
          </Link>
          <Text style={styles.sectionContent}>
            Tinker with the settings:
          </Text>
          <Link href="./settings" style={styles.button}>
            Go to Settings
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  textSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#000'
  },
    scrollViewContent: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 15,
  }
});