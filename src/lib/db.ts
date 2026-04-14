export const ADMINS = ["charithviola@gmail.com", "billysk8r@gmail.com"];

export type Role = "Admin" | "Musician" | "Audience" | "Chapter Director";

export interface User {
    id: string;
    name: string | null;
    email: string | null;
    role: Role;
    image: string | null;
    location: string | null;
    bio: string | null;
    chapters: string | null; // JSON array of chapter IDs follow
    director_chapters: string | null; // JSON array of chapter IDs for directors
}

export interface Chapter {
    id: string;
    location: string;
    bio: string | null;
    image: string | null;
}

export interface Artist {
    id: string;
    name: string;
    location: string | null;
    bio: string | null;
    image: string | null;
    owner_id: string;
    members: string | null; // JSON array of names
    status: "PENDING" | "APPROVED";
    chapters: string | null; // JSON array of chapter IDs
    image_preference: 'custom' | 'google';
}

export interface Booking {
    id: string;
    name: string;
    email: string;
    phone: string;
    questions: string | null;
    image: string | null;
    created_by: string;
    status: "PENDING" | "APPROVED";
    image_preference: 'custom' | 'google';
}

export interface BookingDate {
    id: string;
    booking_id: string;
    date: string;
    time: string;
    duration: string | null;
    event_type: string | null;
    location: string;
    description: string | null;
    budget: string | null;
    is_public: boolean;
}

export interface BlogPost {
    id: string;
    title: string;
    body: string;
    author_id: string;
    image: string | null;
    created_at: string;
    updated_at: string;
}

export interface Event {
    id: string;
    title: string;
    description: string | null;
    venue: string;
    city: string | null;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    link: string | null;
    image: string | null;
    created_at: string;
}

export type RequestType = "ROLE_CHANGE" | "USER_EDIT" | "ARTIST_EDIT" | "ARTIST_ADD" | "BOOKING_INQUIRY" | "BOOKING_EDIT";

export interface UnifiedRequest {
    id: string;
    user_id: string;
    type: RequestType;
    target_id: string | null;
    data: string | null; // JSON string
    status: "PENDING" | "APPROVED" | "REJECTED";
    created_at: string;
    // Joined fields
    user_name?: string;
    user_email?: string;
}


export function isAdmin(email?: string | null): boolean {
    if (!email) return false;
    return ADMINS.includes(email);
}
