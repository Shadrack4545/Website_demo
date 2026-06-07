# Community Platform Frontend Architecture

## Why each folder exists and how it scales

- `src/pages`: route-level compositions (`Dashboard`, `Events`, `Announcements`, `Directory`, `Auth`). Scales by keeping business flow at page level while delegating reusable pieces to components/contexts.
- `src/components/shared`: UI primitives and cross-feature elements. Scales by reducing duplicated styling and behaviors.
- `src/components/events|announcements|auth|layout`: feature-focused UI blocks. Scales by containing feature complexity and enabling isolated refactors.
- `src/context`: global state domains (`AuthContext`, `EventContext`, `NotificationContext`, `DirectoryContext`). Scales by splitting state by domain and avoiding one monolithic store.
- `src/hooks`: custom hooks (`useAuth`, `useEvents`, `useNotifications`, `useDirectory`). Scales by standardizing state access and hiding context internals.
- `src/utils`: helper services such as localStorage abstraction, ID generation, and date helpers. Scales by centralizing low-level logic.
- `src/types`: shared data contracts and backend-ready model shapes. Scales by keeping type contracts stable as API integration is added.
- `src/styles`: Tailwind entry and reusable utility classes. Scales by enforcing consistent design tokens and utility composition.

## Auth state flow

1. Register/Login from auth forms.
2. `AuthContext` validates credentials and updates `currentUser`.
3. Session persists in localStorage (`currentUser`, `users`).
4. App reads persisted session on startup and routes to Auth or Dashboard.
5. Logout clears persisted session and resets auth state.

## localStorage abstraction importance

- Prevents repeated `JSON.parse`/`JSON.stringify` boilerplate.
- Adds centralized error handling for parse/quota issues.
- Keeps storage keys consistent across features.
- Makes migration to backend API/IndexedDB simpler later.

## Example JSON structures

### User
```json
{
  "id": "user_001",
  "name": "Ama Mensah",
  "email": "ama@community.org",
  "country": "Ghana",
  "program": "Master's",
  "role": "leader",
  "createdAt": 1717600000000,
  "updatedAt": 1717600000000
}
```

### Event (with RSVP + attendance)
```json
{
  "id": "event_001",
  "title": "Welcome Mixer",
  "description": "Kickoff event",
  "date": "2026-05-15",
  "time": "18:00",
  "location": "Main Hall",
  "capacity": 120,
  "createdBy": "user_001",
  "rsvps": {
    "user_001": "attending",
    "user_010": "maybe",
    "user_011": "notAttending"
  },
  "attendees": ["user_001"],
  "noShows": [],
  "status": "upcoming",
  "createdAt": 1717600000000,
  "updatedAt": 1717600000000
}
```

### Announcement
```json
{
  "id": "announcement_001",
  "title": "Venue Updated",
  "content": "The event venue has changed.",
  "category": "events",
  "createdBy": "user_001",
  "isPinned": true,
  "linkedEventId": "event_001",
  "createdAt": 1717600100000,
  "updatedAt": 1717600100000
}
```

### Directory Member
```json
{
  "id": "member_001",
  "userId": "user_010",
  "name": "Kwame Boateng",
  "email": "kwame@community.org",
  "country": "Ghana",
  "program": "Bachelor's",
  "joinedAt": 1717600200000,
  "feePaid": true,
  "verificationStatus": "verified",
  "membershipStatus": "active",
  "updatedAt": 1717600300000
}
```

### Notification
```json
{
  "id": "notification_001",
  "recipientId": "user_010",
  "recipientScope": "user",
  "type": "invitation",
  "title": "Event Invitation",
  "message": "You are invited to Welcome Mixer.",
  "relatedId": "event_001",
  "read": false,
  "createdAt": 1717600400000
}
```
