import type { Announcement, DirectoryMember, Event, Notification, User } from './index';

export const exampleUser: User = {
  id: 'user_001',
  name: 'Ama Mensah',
  email: 'ama@community.org',
  password: 'demo-password',
  country: 'Ghana',
  program: "Master's",
  role: 'leader',
  bio: 'Student community coordinator.',
  createdAt: 1717600000000,
  updatedAt: 1717600000000,
};

export const exampleEvent: Event = {
  id: 'event_001',
  title: 'Welcome Mixer',
  description: 'Kickoff event for new and returning members.',
  date: '2026-05-15',
  time: '18:00',
  location: 'Main Hall',
  capacity: 120,
  createdBy: 'user_001',
  rsvps: {
    user_001: 'attending',
    user_010: 'maybe',
    user_011: 'notAttending',
  },
  attendees: ['user_001'],
  noShows: [],
  status: 'upcoming',
  createdAt: 1717600000000,
  updatedAt: 1717600000000,
};

export const exampleAnnouncement: Announcement = {
  id: 'announcement_001',
  title: 'Venue Updated',
  content: 'The mixer venue has changed to Main Hall A.',
  category: 'events',
  createdBy: 'user_001',
  isPinned: true,
  linkedEventId: 'event_001',
  createdAt: 1717600100000,
  updatedAt: 1717600100000,
};

export const exampleDirectoryMember: DirectoryMember = {
  id: 'member_001',
  userId: 'user_010',
  name: 'Kwame Boateng',
  email: 'kwame@community.org',
  country: 'Ghana',
  program: "Bachelor's",
  joinedAt: 1717600200000,
  feePaid: true,
  lastActive: 1717600300000,
  interests: ['leadership', 'networking'],
  verificationStatus: 'verified',
  membershipStatus: 'active',
  updatedAt: 1717600300000,
};

export const exampleNotification: Notification = {
  id: 'notification_001',
  recipientId: 'user_010',
  recipientScope: 'user',
  type: 'invitation',
  title: 'Event Invitation',
  message: 'You are invited to Welcome Mixer.',
  relatedId: 'event_001',
  read: false,
  createdAt: 1717600400000,
};
