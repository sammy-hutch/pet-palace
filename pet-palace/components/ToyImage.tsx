import { ImageSourcePropType, View } from "react-native";
import { Image } from "expo-image";

type Props = {
    imageSize: number;
    imageSource: ImageSourcePropType;
};

export default function ToyImage({ imageSize, imageSource }: Props) {
    return (
        <View style={{ top: -350 }}>
            <Image source={imageSource} style={{ width: imageSize, height: imageSize }} />
        </View>
    );
}
