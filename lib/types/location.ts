// lib/types/location.ts

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface LocationData {
    coordinates: Coordinates;
    address: string | null;
    formattedAddress: string | null;
    placeId: string | null;
    neighborhood: string | null;
    city: string | null;
    region: string | null;
    country: string | null;
    postalCode: string | null;
}

export interface MemberLocation {
    memberId: string;
    memberName: string;
    location: LocationData;
    houseNumber?: string | null;
    placeOfStay?: string | null;
}

export interface GeocodeResult {
    formattedAddress: string;
    lat: number;
    lng: number;
    placeId?: string;
    neighborhood?: string;
    city?: string;
    region?: string;
    country?: string;
    postalCode?: string;
}