/**
 * Data Models for African Student Community Platform
 * 
 * These TypeScript interfaces define the structure of our core entities.
 * They are designed to support:
 * - RSVP tracking for events
 * - Role-based logic (leader/member)
 * - Future backend integration with REST APIs
 */

// Role types for access control
// super-admin: Can manage all roles, see audit logs, assign positions
// admin: Promoted members with event/member management, cannot manage roles
// leader: Alias for admin (for backwards compatibility)
// member: Regular user
export type UserRole = 'super-admin' | 'admin' | 'leader' | 'member';
export type RSVPStatus = 'attending' | 'notAttending' | 'maybe';
export type AnnouncementCategory = 'events' | 'admin' | 'resources';
export type NotificationType =
  | 'invitation'
  | 'reminder'
  | 'announcement'
  | 'memberJoined'
  | 'eventAttendance'
  | 'system';

/**
 * User Model
 * Represents a registered user in the system
 * 
 * Fields:
 * - id: Unique identifier (generated on signup)
 * - name: Full name of the user
 * - email: Email address (used for login)
 * - password: Hashed password (in production, this would be on backend)
 * - country: Country of origin
 * - program: Academic program (e.g., Bachelor, Master, PhD)
 * - role: User's role (determines permissions)
 * - createdAt: Account creation timestamp
 * 
 * Why this structure:
 * - Email as unique identifier for authentication
 * - Role-based access control for leaders vs members
 * - Country and program for filtering/community building
 * - Timestamps for tracking and analytics
 */
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  country: string;
  program: string;
  securityQuestion?: string;
  securityAnswer?: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  lastLoginAt?: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Event Model
 * Represents a community event
 * 
 * Fields:
 * - id: Unique event identifier
 * - title: Event name
 * - description: Event details
 * - date: Event date in ISO format
 * - time: Event time (HH:MM format)
 * - location: Where the event happens
 * - capacity: Max attendees allowed
 * - createdBy: ID of the leader who created it
 * - rsvps: Map of user IDs to their RSVP status
 * - attendees: Array of user IDs who actually attended (after event)
 * - noShows: Array of user IDs who said yes but didn't attend
 * - status: Event state (upcoming, completed, cancelled)
 * - createdAt: When event was created
 * 
 * Why this structure:
 * - RSVP tracking prevents duplicate responses and enables analytics
 * - Attendance tracking for no-show metrics
 * - Leader identification for permission checks
 * - Timestamps for reminders and sorting
 * - Status field for filtering upcoming vs past events
 */
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  createdBy: string;
  rsvps: Record<string, RSVPStatus>;
  attendees: string[];
  noShows: string[];
  reminderSentAt?: number;
  invitationSentAt?: number;
  reminderAnnouncementId?: string;
  linkedAnnouncementId?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Announcement Model
 * Represents a community announcement or update
 * 
 * Fields:
 * - id: Unique announcement identifier
 * - title: Announcement headline
 * - content: Full announcement text
 * - category: Type of announcement for filtering
 * - createdBy: ID of the user who posted
 * - isPinned: Whether announcement should appear at top
 * - createdAt: When announced was posted
 * 
 * Why this structure:
 * - Categories allow members to filter announcements they care about
 * - Pinning ensures critical info stays visible
 * - Creator info for context and permissions
 * - Timestamps for sorting and search
 * - Designed for searchability (can add tags later)
 */
export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  createdBy: string;
  isPinned: boolean;
  linkedEventId?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Member Model
 * Represents community membership information
 * 
 * Fields:
 * - id: Member ID (same as user ID)
 * - userId: Link to User model
 * - joinedAt: When they joined the community
 * - feePaid: Whether membership fee is paid
 * - lastActive: Last activity timestamp for engagement metrics
 * - interests: Tags for community interests
 * - verificationStatus: Whether account is verified
 * 
 * Why this structure:
 * - Separates user account data from community membership data
 * - Enables fee tracking (important for leader pain point)
 * - Last active for engagement analytics
 * - Interests for future recommendations/matching
 * - Can extend with additional community-specific fields
 */
export interface DirectoryMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  country: string;
  program: string;
  joinedAt: number;
  feePaid: boolean;
  lastActive: number;
  interests: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  membershipStatus: 'active' | 'inactive' | 'suspended';
  bio?: string;
  updatedAt: number;
}

/**
 * Notification Model
 * Represents in-app notifications sent to users
 * 
 * Fields:
 * - id: Unique notification ID
 * - recipientId: User who receives the notification
 * - type: What kind of notification (for different UI/actions)
 * - title: Notification headline
 * - message: Notification body
 * - relatedId: ID of related entity (eventId, announcementId, etc.)
 * - read: Whether user has seen it
 * - createdAt: When notification was sent
 * - expiresAt: When to remove notification (optional)
 * 
 * Why this structure:
 * - Centralized notification system for all event types
 * - Read status for marking as seen
 * - Related ID for linking to actual events/announcements
 * - Type field for future filtering and different UI presentations
 * - Expiry for auto-cleanup of old notifications
 * - Scalable for adding web push notifications later
 */
export interface Notification {
  id: string;
  recipientId: string;
  recipientRole?: UserRole;
  recipientScope: 'user' | 'role' | 'all';
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  read: boolean;
  createdAt: number;
  expiresAt?: number;
}

/**
 * Dashboard Stats Model
 * Computed statistics for leader dashboard
 * 
 * This is NOT stored - it's computed on the fly from other models
 * Included for type safety in dashboard components
 */
export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  averageAttendanceRate: number;
  totalAnnouncements: number;
  pendingMembers: number;
}

export interface EventInput {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
}

export interface AnnouncementInput {
  title: string;
  content: string;
  category: AnnouncementCategory;
  isPinned?: boolean;
  linkedEventId?: string;
}

/**
 * Why this Architecture Scales Well:
 * 
 * 1. Clear Separation of Concerns
 *    - Each entity is responsible for its own data
 *    - Easy to add/remove fields without breaking other models
 * 
 * 2. Frontend-Ready
 *    - All data structures can be stored in localStorage (JSON serializable)
 *    - Can be directly mapped to REST API responses later
 * 
 * 3. Role-Based Access
 *    - User.role enables permission checks everywhere
 *    - Event.createdBy allows ownership verification
 * 
 * 4. Audit Trail
 *    - createdAt, updatedAt fields track changes
 *    - createdBy tracks ownership/responsibility
 * 
 * 5. Future Backend Migration
 *    - These interfaces match typical REST API responses
 *    - Can add backend URLs/endpoints easily
 *    - No refactoring needed when connecting to API
 * 
 * 6. Analytics Ready
 *    - All timestamps enable trend analysis
 *    - RSVP/attendance data enables engagement metrics
 *    - Last active tracking enables user metrics
 */

/**
 * Achievement & Badge Model
 * Represents accomplishments and badges earned by community members or the organization
 */
export type AchievementType = 'community' | 'individual' | 'milestone' | 'special';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji or icon identifier
  type: AchievementType;
  badgeColor: string; // Hex or Tailwind class
  
  // For individual achievements
  recipientId?: string;
  recipientName?: string;
  
  // For community achievements
  communityAchievement?: boolean;
  impact?: string; // e.g., "250 members", "5 events organized"
  
  // Metadata
  date: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Group Chat Request Model
 * Represents a request from members to create a group chat
 * 
 * Fields:
 * - id: Unique request identifier
 * - name: Proposed group chat name
 * - description: Purpose/topic of the chat
 * - requestedBy: ID of member requesting the chat
 * - requestedByName: Name of requester (for display)
 * - members: IDs of proposed members (if targeted group)
 * - status: Approval status
 * - approvedBy: Admin ID who approved (if status='approved')
 * - rejectionReason: Why request was rejected (if status='rejected')
 * - createdAt: When request was submitted
 * - approvedAt: When admin reviewed
 * 
 * Why this structure:
 * - Admins control chat creation to prevent spam
 * - Tracks who requested and who approved
 * - Audit trail with timestamps
 * - Optional member list for pre-defined groups
 */
export type ChatRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ChatRequest {
  id: string;
  name: string;
  description: string;
  requestedBy: string;
  requestedByName: string;
  members: string[]; // Proposed member IDs
  status: ChatRequestStatus;
  approvedBy?: string;
  approvedByName?: string;
  rejectionReason?: string;
  createdAt: number;
  approvedAt?: number;
}

/**
 * Group Chat Model
 * Represents an approved group chat channel
 */
export interface GroupChat {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdByName: string;
  members: string[]; // User IDs
  chatRequestId?: string; // Link to the approval request
  createdAt: number;
  updatedAt: number;
}

/**
 * Leadership Term Model
 * Tracks leadership roles and their terms (for annual elections)
 */
export interface LeadershipTerm {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  position: 'President' | 'Vice President' | 'Treasurer' | 'Secretary' | 'Event Coordinator' | 'Admin';
  startDate: number; // Timestamp
  endDate: number; // Timestamp
  status: 'active' | 'past' | 'upcoming';
  createdAt: number;
  updatedAt: number;
}

/**
 * Role Change Audit Log Model
 * Tracks all role changes for accountability and history
 */
export interface RoleAuditLog {
  id: string;
  changedBy: string; // Super admin who made the change
  changedByName: string;
  targetUserId: string;
  targetUserName: string;
  targetUserEmail: string;
  oldRole: UserRole;
  newRole: UserRole;
  action: 'promote' | 'demote' | 'assign' | 'remove';
  reason?: string;
  changeType: 'immediate' | 'term-based'; // Immediate or for specific term
  termId?: string; // If term-based
  createdAt: number;
}

/**
 * Role Management Context State
 */
export interface RoleManagementState {
  auditLogs: RoleAuditLog[];
  leadershipTerms: LeadershipTerm[];
  currentTermId?: string;
}
