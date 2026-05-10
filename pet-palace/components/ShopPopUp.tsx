import { View, Text, Pressable, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  title: string;
}>;

const TAB_BAR_HEIGHT = 50;

export default function ShopPopUp({ isVisible, children, onClose, title }: Props) {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;

  const translateY = useRef(new Animated.Value(screenHeight)).current; // Start off-screen at the bottom
  const opacity = useRef(new Animated.Value(0)).current; // Start transparent

  // New state to control mounting/unmounting of the modal
  const [isModalMounted, setIsModalMounted] = useState(false);

  useEffect(() => {
      if (isVisible) {
          setIsModalMounted(true); // Mount the modal component immediately when it should be visible
          Animated.parallel([
              Animated.timing(translateY, {
                  toValue: 0, // Slide up to its natural position
                  duration: 300,
                  easing: Easing.out(Easing.ease),
                  useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                  toValue: 1, // Fade in the overlay
                  duration: 200,
                  useNativeDriver: true,
              }),
          ]).start();
      } else {
          // Start exit animation
          Animated.parallel([
              Animated.timing(translateY, {
                  toValue: screenHeight, // Slide back off-screen
                  duration: 300,
                  easing: Easing.in(Easing.ease),
                  useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                  toValue: 0, // Fade out the overlay
                  duration: 100,
                  useNativeDriver: true,
              }),
          ]).start(() => {
              // After the exit animation completes, unmount the modal component
              setIsModalMounted(false);
          });
      }
  }, [isVisible, screenHeight]); // Dependencies for the effect

  // Don't render anything if the modal is not mounted
  if (!isModalMounted) {
      return null;
  }

  const modalMaxHeight = screenHeight - TAB_BAR_HEIGHT - insets.bottom;

  return (
      <Animated.View style={[
          styles.modalContainer,
          { opacity: opacity }
      ]}>
          <Pressable style={styles.overlayBackground} onPress={onClose} />

          <Animated.View style={[
              styles.modalContent,
              {
                  maxHeight: modalMaxHeight,
                  paddingBottom: insets.bottom,
                  transform: [{ translateY: translateY }]
              }
          ]}>
              <View style={styles.titleContainer}>
                  <Text style={styles.title}>{title}</Text>
                  <Pressable onPress={onClose}>
                      <Ionicons name="close" color="#fff" size={22} />
                  </Pressable>
              </View>
              {children}
          </Animated.View>
      </Animated.View>
  );
}

const styles = StyleSheet.create({
modalContainer: {
  ...StyleSheet.absoluteFillObject,
  justifyContent: 'flex-end',
  zIndex: 10,
},
overlayBackground: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
modalContent: {
  width: '100%',
  backgroundColor: '#25292e',
  borderTopRightRadius: 18,
  borderTopLeftRadius: 18,
},
titleContainer: {
  height: 60,
  backgroundColor: '#464C55',
  borderTopRightRadius: 10,
  borderTopLeftRadius: 10,
  paddingHorizontal: 20,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
title: {
  color: '#fff',
  fontSize: 16,
},
});