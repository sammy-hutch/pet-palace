
export interface GenericDbItem {
   [key: string]: any;
}

export interface Cat extends GenericDbItem {
    cat_id: number;
    cat_name: string;
    cat_cost: number;
    preferred_toy_name: string;
    preferred_room_name: string;
}

export interface Toy extends GenericDbItem {
    toy_id: number;
    toy_name: string;
    toy_cost: number;
    enrichment_type: string;
    enrichment_value: number;
}

export interface Room extends GenericDbItem {
    room_id: number;
    room_name: string;
    room_cost: number;
    enrichment_type: string;
    enrichment_value: number;
}

export type PurchasableItem = Cat | Toy | Room;