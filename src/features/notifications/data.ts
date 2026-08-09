// Mock content matching the Figma "Notifications Center" section (1432:52456);
// replaced by API data once the notifications backend is ready.

export interface NotificationAction {
  label: string;
  variant: 'primary' | 'secondary';
}

export interface NotificationItem {
  id: string;
  name: string;
  message: string;
  timestamp: string;
  actions?: NotificationAction[];
}

export interface NotificationGroup {
  id: string;
  label: string;
  items: NotificationItem[];
}

// Grouped-by-date notification feed (Figma 1445:12601)
export const NOTIFICATION_GROUPS: NotificationGroup[] = [
  {
    id: 'today',
    label: 'Today',
    items: [
      {
        id: 'n1',
        name: 'Priya Sharla',
        message: 'Invite you to join daily walking tomorrow.',
        timestamp: '1 hr ago',
        actions: [
          { label: 'View', variant: 'secondary' },
          { label: 'Accept', variant: 'primary' },
        ],
      },
    ],
  },
  {
    id: '2024-04-10',
    label: '10 April, 2024',
    items: [
      {
        id: 'n2',
        name: 'Priya Sharla',
        message: 'Confirmed to set up with HelpAge Well',
        timestamp: 'Tue , 5:10 pm',
      },
    ],
  },
];
