import { theme } from '@/theme';
import type { IconName } from '@/components/icons';

// Mock content matching the Figma "Emergency Support (Helpline)" section (1380:37923);
// replaced by API data once the emergency/location services backend is ready.

export interface QuickAction {
  id: 'shareLocation' | 'supportChat' | 'emResponder' | 'helpline';
  label: string;
  icon: IconName;
}

// "Quick Actions" grid (Figma 1322:11276)
export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'shareLocation', label: 'Share\nLocation', icon: 'placeLocation' },
  { id: 'supportChat', label: 'Support\nChat', icon: 'message' },
  { id: 'emResponder', label: 'EM\nResponder', icon: 'doctor' },
  { id: 'helpline', label: 'Helpline', icon: 'phone' },
];

export interface HelplineOrg {
  id: string;
  name: string;
  city: string;
  distanceKm: number;
  rating: number;
  verified: boolean;
  featured?: boolean;
  image: number;
  /** Set when `image`'s natural aspect ratio is portrait, so the card crops to its
   *  top instead of its (likely blank) center when squeezed into the wide thumbnail slot. */
  imageAspectRatio?: number;
}

// Helpline organization list (Figma 1376:16867)
export const HELPLINE_ORGS: HelplineOrg[] = [
  {
    id: 'helpage',
    name: 'HelpAge India',
    city: 'Delhi',
    distanceKm: 8.7,
    rating: 4.6,
    verified: true,
    image: theme.images.helpline,
  },
  {
    id: 'nhrc',
    name: 'NHRC/HelpAge',
    city: 'Delhi',
    distanceKm: 8.7,
    rating: 4.6,
    verified: true,
    featured: true,
    image: theme.images.helpline,
  },
];

// Emergency medical responder list (Figma 1376:17625)
export const EM_RESPONDERS: HelplineOrg[] = [
  {
    id: 'emoha',
    name: 'Emoha Elder Care',
    city: 'Gurgaon / Delhi',
    distanceKm: 0,
    rating: 4.6,
    verified: true,
    image: theme.images.emResponder,
    imageAspectRatio: 1440 / 1800, // source is a portrait poster — crop to its top
  },
];

export interface ShareContact {
  id: string;
  label: string;
}

// "Whom are you sharing location with?" options (Figma 1373:11303)
export const SHARE_CONTACTS: ShareContact[] = [
  { id: 'emergency', label: 'Emergency' },
  { id: 'son', label: 'Suresh Sharma, Son' },
  { id: 'saathi', label: 'Saathi' },
];

// Mock reverse-geocoded address shown once location permission is granted (Figma 1372:8432)
export const MOCK_LOCATION = {
  place: 'Dilli Haat - INA, Delhi',
  address: 'Sri Aurobindo Marg, Aviation Colony, INA Colony, New Delhi, Delhi 110023',
};

export interface ChatMessage {
  id: string;
  from: 'bot' | 'me';
  text?: string;
  imageUri?: string;
}

// Suggested prompts shown before a conversation starts (Figma 1376:19257)
export const SUPPORT_CHAT_SUGGESTIONS: string[] = [
  'How do I request a caregiver visit?',
  'What are your Helpline numbers?',
  'How can I update my emergency contacts?',
  'Can you tell me where the hospital is near my place?',
];

// Canned bot replies keyed by suggestion text (Figma 1376:19328); anything else falls
// back to DEFAULT_CHAT_REPLY.
export const CHAT_REPLIES: Record<string, string> = {
  'Can you tell me where the hospital is near my place?':
    'Yes, there are hospitals nearby. What kind of doctor are you looking for?',
  'How do I request a caregiver visit?':
    'You can request a caregiver from the Services tab — tap Infrastructure, then Caregiver.',
  'What are your Helpline numbers?':
    'You can reach our partner helplines from the Helpline tab, or dial 112 for emergencies.',
  'How can I update my emergency contacts?':
    'Go to Profile > Circle of Care to add or update the people you share your location with.',
};

export const DEFAULT_CHAT_REPLY =
  "Thanks for reaching out — a support specialist will follow up with you shortly.";

export const IMAGE_CHAT_REPLY =
  "Got it, thanks for sharing that photo — a support specialist will take a look and follow up with you.";

export const EMERGENCY_SOS_NUMBER = '112';
