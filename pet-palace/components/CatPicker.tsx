import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { PropsWithChildren } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = PropsWithChildren<{
    isVisible: boolean;
    onClose: () => void;
}>;

export default function CatPicker({ isVisible, children, onClose }: Props) {
    return (
        <View>
            <Modal animationType="slide" transparent={true} visible={isVisible}>
                <View style={styles.modalContent}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Adopt a cat</Text>
                        <Pressable onPress={onClose}>
                            <Ionicons name="close" color="#fff" size={22} />
                        </Pressable>
                    </View>
                    {children}
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
  modalContent: {
    height: '100%',
    width: '100%',
    backgroundColor: '#25292e',
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    position: 'absolute',
    bottom: 0,
  },
  titleContainer: {
    height: '16%',
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
