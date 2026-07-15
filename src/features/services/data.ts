import { theme } from '@/theme';
import type { IconName } from '@/components/icons';

// Mock content matching the Figma "Services" section frames; replaced by API data later.

export interface ServiceCategory {
  id: string;
  label: string;
  icon: IconName;
}

// "What do you need help with?" grid (Figma 1255:26926)
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'infrastructure', label: 'Infrastructure', icon: 'group' },
  { id: 'courses', label: 'Courses', icon: 'book' },
  { id: 'experts', label: 'Experts', icon: 'experts' },
  { id: 'events', label: 'Events', icon: 'events' },
  { id: 'social', label: 'Social Events', icon: 'events' },
  { id: 'products', label: 'Products', icon: 'products' },
  { id: 'services', label: 'Services', icon: 'service' },
  { id: 'travel', label: 'Travel', icon: 'passport' },
  { id: 'usp', label: 'USP', icon: 'usp' },
];

// "Who needs care?" options (Figma 1256:23704)
export const INFRASTRUCTURE_OPTIONS = [
  { id: 'caregiver', label: 'Caregiver', available: 8, icon: 'caregiver' as IconName },
  { id: 'nursing', label: 'Nursing Care', available: 2, icon: 'nursing' as IconName },
  { id: 'physiotherapy', label: 'Physiotherapy', available: 2, icon: 'physiotherapy' as IconName },
  { id: 'attendants', label: 'Attendants', available: 5, icon: 'doctor' as IconName },
  { id: 'rehabilitation', label: 'Rehabilitation Care', available: 11, icon: 'medicine' as IconName },
];

export interface Organization {
  id: string;
  name: string;
  city: string;
  distanceKm: number;
  rating: number | null;
  ratingCount: number;
  image: any | null; // require() asset or null (grey placeholder)
  featured?: boolean;
  founded: string;
  mission: string;
  impact: string[];
  programs: string[];
  services: string[];
  price: string;
}

// "Caregiver training" list (Figma 1256:24028) + Comparison table content (1256:24299)
export const ORGANIZATIONS: Organization[] = [
  {
    id: 'agewell',
    name: 'AgeWell Foundation',
    city: 'Delhi',
    distanceKm: 8.7,
    rating: 4.6,
    ratingCount: 47,
    image: theme.images.onboarding1,
    featured: true,
    founded: '1999',
    mission: 'Rights & dignity of elders',
    impact: ['Strong advocacy', 'High trust'],
    programs: ['Strong advocacy', 'Volunteer Programs'],
    services: ['Companionship Volunteers', 'Emotional Support', 'Emergency Helpline'],
    price: 'Free',
  },
  {
    id: 'helpage',
    name: 'HelpAge India',
    city: 'Delhi',
    distanceKm: 8.7,
    rating: 4.6,
    ratingCount: 32,
    image: theme.images.onboarding3,
    founded: '1978',
    mission: 'Improve quality of life',
    impact: ['Strong healthcare', 'Very High trust'],
    programs: ['Advocacy', 'Volunteer Programs', 'Livelihood Programs', 'Digital Literacy'],
    services: ['Companionship Limited', 'Emotional Support', 'Emergency Helpline', 'Home Support'],
    price: '₹20,000',
  },
  {
    id: 'dignity',
    name: 'Dignity Foundation',
    city: 'Delhi',
    distanceKm: 20.7,
    rating: 5,
    ratingCount: 32,
    image: theme.images.onboarding2,
    founded: '1978',
    mission: 'Improve quality of life',
    impact: ['Strong advocacy', 'Very High trust'],
    programs: ['Advocacy', 'Volunteer Programs', 'Dignity Community Centers'],
    services: ['Companionship Clubs', 'Emotional Support', 'Emergency Helpline'],
    price: '₹20,000',
  },
  {
    id: 'samvedna',
    name: 'Samvedna Senior Care',
    city: 'Gurgaon',
    distanceKm: 20.7,
    rating: 4.5,
    ratingCount: 21,
    image: null,
    founded: '2013',
    mission: 'Dementia & senior mental health',
    impact: ['Clinical expertise', 'High trust'],
    programs: ['Dementia Care', 'Counselling'],
    services: ['Companionship', 'Emotional Support'],
    price: '₹25,000',
  },
  {
    id: 'nisd',
    name: 'National Institute of Social Defense (NISD)',
    city: 'Dwarka',
    distanceKm: 20.7,
    rating: 4.7,
    ratingCount: 12,
    image: null,
    founded: '1961',
    mission: 'Training & capacity building',
    impact: ['Government backed'],
    programs: ['Caregiver Training'],
    services: ['Training Programs'],
    price: 'Free',
  },
  {
    id: 'epoch',
    name: 'Epoch Elder Care',
    city: 'Gurgaon',
    distanceKm: 20.7,
    rating: 4.2,
    ratingCount: 18,
    image: null,
    founded: '2012',
    mission: 'Assisted living homes',
    impact: ['Premium care'],
    programs: ['Assisted Living'],
    services: ['Residential Care'],
    price: '₹80,000',
  },
  {
    id: 'silverinnings',
    name: 'Silver Innings Foundation',
    city: 'Mumbai',
    distanceKm: 20.7,
    rating: null,
    ratingCount: 0,
    image: null,
    founded: '2008',
    mission: 'Elder friendly world',
    impact: ['Community programs'],
    programs: ['Awareness Programs'],
    services: ['Helpline'],
    price: 'Free',
  },
  {
    id: 'goodfellows',
    name: 'The Good Fellows',
    city: 'Mumbai',
    distanceKm: 20.7,
    rating: null,
    ratingCount: 0,
    image: null,
    founded: '2021',
    mission: 'Intergenerational friendship',
    impact: ['Companionship focus'],
    programs: ['Grandkids on demand'],
    services: ['Companionship'],
    price: '₹5,000',
  },
];

export const getOrganization = (id: string): Organization =>
  ORGANIZATIONS.find((o) => o.id === id) ?? ORGANIZATIONS[0];
