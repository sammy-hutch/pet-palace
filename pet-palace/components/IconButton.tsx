import { Pressable, StyleSheet, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
};

export default function IconButton({ icon, label, onPress }: Props) {
    return (
        <Pressable style={styles.iconButton} onPress={onPress}>
            <Ionicons name={icon} size={24} color="#fff" />
            <Text style={styles.iconButtonLabel}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonLabel: {
    color: '#fff',
    marginTop: 12,
  },
});
