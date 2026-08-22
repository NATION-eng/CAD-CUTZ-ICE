export interface ServiceItem {
  id: string;
  name: string;
  category: "Barbering" | "Beard & Shave" | "Treatments & Color" | "Dreadlocks" | "Nails & Pedicure" | "Young Gentlemen" | "Amenities";
  price: number;
  duration: number; // in minutes
  description?: string;
  popular?: boolean;
  note?: string;
}

export interface Artisan {
  id: string;
  name: string;
  role: string;
  specialty: string;
  experience: string;
  rating: number;
  avatar: string;
  instagram?: string;
  workingDays: string[];
}

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  services: string[]; // Support multi-services
  service: string; // Primary service string for backwards compatibility
  totalPrice: number;
  price: number;
  duration: number;
  artisan: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM or HH:MM AM/PM
  status: "active" | "in-chair" | "completed" | "cancelled" | "no-show";
  isReady?: boolean;
  sessionStartedAt?: any;
  completedAt?: any;
  createdAt?: any;
  notes?: string;
}

export interface MessageItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "unread" | "read";
  createdAt?: any;
}

export interface SalonHours {
  [day: string]: {
    open: string; // e.g. "09:00"
    close: string; // e.g. "22:00"
    isOpen: boolean;
  };
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title?: string;
  message: string;
  duration?: number;
}
