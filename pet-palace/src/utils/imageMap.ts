
import { ImageSourcePropType } from 'react-native';

type CatImageMap = {
    [key: string]: ImageSourcePropType;
};

export const imageSources: CatImageMap = {
    'Sissi': require('../../assets/images/cats/Sissi.png'),
    'Max': require('../../assets/images/cats/Max.png'),
    'Sot': require('../../assets/images/cats/Sot.png'),
    'Larry': require('../../assets/images/cats/Larry.png'),
    'LP': require('../../assets/images/cats/LP.png'),

    'Ball': require('../../assets/images/toys/Ball.png'),
    'Scratching Post': require('../../assets/images/toys/ScratchingPost.png'),
    'Feather Wand': require('../../assets/images/toys/FeatherWand.png'),
    'Yarn': require('../../assets/images/toys/Yarn.png'),
    'Catnip Mouse': require('../../assets/images/toys/CatnipMouse.png'),

    'Pink Room': require('../../assets/images/rooms/PinkRoom.png'),
    'Cabin Room': require('../../assets/images/rooms/CabinRoom.png'),
    'Cosy Room': require('../../assets/images/rooms/CosyRoom.png'),
    'Plant Room': require('../../assets/images/rooms/PlantRoom.png'),
    'Garden': require('../../assets/images/rooms/Garden.png'),
};