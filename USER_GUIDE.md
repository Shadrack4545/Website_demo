# African Student Community Platform - User Guide

## Table of Contents
1. [Platform Overview](#platform-overview)
2. [Getting Started](#getting-started)
3. [User Roles & Privileges](#user-roles--privileges)
4. [Features by Role](#features-by-role)
5. [Feature Guides](#feature-guides)
6. [Frequently Asked Questions](#frequently-asked-questions)

---

## Platform Overview

### Purpose
The **African Student Community Platform** is a web-based application designed to connect African students at Vladivostok State University. It facilitates:
- Event management and coordination
- Community announcements and resources
- Member directory and networking
- Leadership visibility and communication
- Activity tracking and engagement metrics
- Member verification and moderation
- Group chat coordination
- Achievement recognition

### Core Values
- **Community**: Connect African students across all programs
- **Engagement**: Keep members informed and active
- **Transparency**: Clear leadership structure and decision-making
- **Accessibility**: Easy-to-use interface in English and Russian
- **Inclusivity**: All members have a voice and can participate

### Technology Stack
- **Frontend**: React 18.2 + TypeScript
- **Styling**: Tailwind CSS 3.3
- **State Management**: React Context API
- **Localization**: i18next (English/Russian)
- **Storage**: Browser localStorage (development)
- **Build Tool**: Vite 4.4

---

## Getting Started

### Account Registration

#### Step 1: Create an Account
1. Visit the application at `http://localhost:5176`
2. Click **"Sign Up"** button
3. Fill in the registration form:
   - **Name**: Your full name
   - **Email**: Your email address (must be unique)
   - **Password**: At least 6 characters
   - **Country**: Select your country of origin
   - **Program**: Select your academic program (Bachelor, Master, PhD)
   - **Security Question**: Choose a security question (for account recovery)
   - **Security Answer**: Provide your answer

#### Step 2: First Login
- The first registered account automatically becomes an **Admin**
- All subsequent accounts are registered as **Members**
- You can be promoted to **Leader** by an admin

#### Step 3: Accessing Your Dashboard
- After login, you'll see the main dashboard
- Use the **sidebar** to navigate between different sections
- Your profile icon is in the top-right corner

### Account Recovery

#### If You Forgot Your Password:
1. Click **"Forgot Password?"** on the login page
2. Enter your account verification details:
   - Full name (exactly as registered)
   - Country
   - Program
   - Security question and answer
3. Set a new password (minimum 6 characters)
4. Click **"Recover Account"**
5. You'll receive your email and can login with the new password

---

## User Roles & Privileges

### Role Hierarchy

```
ADMIN (Highest Privileges)
  ├─ Manage all features
  ├─ Approve/reject chat requests
  ├─ Remove members
  ├─ View analytics
  └─ Assign leadership roles

LEADER (Medium Privileges)
  ├─ Create events
  ├─ Post announcements
  ├─ Verify new members
  ├─ Manage resources
  └─ Create achievements

MEMBER (Basic Privileges)
  ├─ View events & announcements
  ├─ RSVP to events
  ├─ Request group chats
  ├─ Update profile
  └─ Access directory
```

### Role Definitions

#### Admin
- **Full platform access**
- Can manage all content and users
- Approve critical requests (chat groups)
- Remove/block suspicious members
- View detailed analytics
- Assign roles to members

#### Leader
- **Enhanced community management**
- Create and manage events
- Post announcements
- Verify pending members
- Create and manage achievements
- Upload resources
- Request group chats

#### Member
- **Basic community participation**
- View events, announcements, directory
- RSVP to events
- Request group chats
- Update personal profile
- Earn achievements
- Participate in discussions

---

## Features by Role

### 📊 Dashboard
**Available To**: All Users
- Quick overview of upcoming events
- Recent announcements
- Pending tasks (if admin/leader)
- Quick action buttons

### 📅 Events

#### For All Members:
- View all upcoming events
- See event details (date, time, location, description)
- RSVP to events (Attending, Not Attending, Maybe)
- View attendee count
- Search events by date/location

#### For Leaders/Admins:
- **Create Events**: 
  1. Click "📅 Events" → "Create Event"
  2. Fill in: Title, description, date, time, location, capacity
  3. Set the event status
  4. Click "Create"
- **Edit Events**: Modify event details before event date
- **Cancel Events**: Mark as cancelled with notification
- **View RSVPs**: See who's attending/not attending
- **Track Attendance**: Record who actually attended

#### How to RSVP:
1. Go to "📅 Events"
2. Find the event you're interested in
3. Click the event to see details
4. Select "Attending", "Not Attending", or "Maybe"
5. Your response is saved immediately

### 📢 Announcements

#### For All Members:
- View community announcements
- Filter by category:
  - **Events**: Event-related updates
  - **Admin**: Important policy updates
  - **Resources**: New materials available
- See when announcement was posted
- View linked events (if any)

#### For Leaders/Admins:
- **Create Announcements**:
  1. Click "📢 Announcements"
  2. Click "Create Announcement"
  3. Fill in: Title, content, category
  4. Optionally pin (make it sticky/highlighted)
  5. Optionally link to an event
  6. Click "Post"
- **Pin/Unpin**: Keep important announcements at the top
- **Edit/Delete**: Modify or remove announcements

### 👥 Directory

#### For All Members:
- Search community members by name or email
- View member profiles:
  - Profile picture
  - Name, email, country, program
  - Bio (if provided)
  - Join date
  - Verification status
- Filter by verification status
- Connect with fellow students

#### For Leaders/Admins:
- Same as members, plus:
- View detailed member statistics
- See membership payment status
- Verify pending members:
  1. Go to "✅ Verification"
  2. Review pending members
  3. Click "Approve" or "Reject"
  4. Members receive notification

### ⭐ Leadership

#### For All Members:
- View admin and leader profiles
- See their roles and responsibilities
- Quick contact information
- Leadership team structure

#### For Admins:
- Automatically displayed as admin
- Other leaders promoted by existing admins

### 🏆 Achievements

#### For All Members:
- View community achievements
- View individual member achievements
- See achievement types:
  - 🎯 **Community**: Events hosted, milestones reached
  - 🌟 **Individual**: Member recognitions
  - 📍 **Milestone**: Significant organizational achievements
  - 🎁 **Special**: Special occasions and awards
- Filter achievements by type
- See creation date and creator

#### For Leaders/Admins:
- **Create Achievements**:
  1. Go to "🏆 Achievements"
  2. Click "Create Achievement"
  3. Fill in:
     - **Title**: Name of the achievement
     - **Description**: Details about it
     - **Icon**: Choose an emoji
     - **Type**: Community/Individual/Milestone/Special
     - **Color**: Badge color
     - **Impact** (optional): e.g., "250 members"
     - **Recipient** (optional): For individual awards
  4. Click "Create"
- **Delete Achievements**: Remove if created by mistake
- **Recognize Members**: Award individual achievements

### 💬 Group Chats

#### For All Members:
1. **Request New Chat**:
   - Click "💬 Group Chats"
   - Click "+ Request Chat"
   - Fill in:
     - **Chat Name**: What you want to call the group
     - **Description**: Purpose of the chat
     - **Members** (optional): Tag specific members to invite
   - Click "Submit Request"
   - Wait for admin approval

2. **View Your Requests**:
   - See status: ⏳ Pending, ✓ Approved, ✕ Rejected
   - If rejected, see the reason provided

3. **Join Approved Chats**:
   - Once approved by admin, chat appears in "Active Chats"
   - Click "Open Chat →" to join
   - See all members in the chat

#### For Admins:
- **Manage Chat Requests**:
  1. Click "⚙️ Manage Chats" (admin only)
  2. View "⏳ Pending" tab to see new requests
  3. Review request details:
     - Chat name and description
     - Who requested it
     - Proposed members
  4. **Approve**: Creates active chat, members get access
  5. **Reject**: Deny the request with a reason explaining why

- **Monitor Active Chats**:
  - View all active group chats
  - See member lists for each chat
  - View creation date and creator
  - Ensure appropriate chat usage

### 📚 Resources

#### For All Members:
- Browse available resources and learning materials
- Search by category or keyword
- Download or view resources
- See resource type and added date

#### For Leaders/Admins:
- Upload new resources:
  1. Go to "📚 Resources"
  2. Click "Upload Resource"
  3. Provide: Title, description, file/link
  4. Categorize the resource
  5. Click "Upload"
- Organize by category
- Edit/delete resources

### 💭 Forum

#### For All Members:
- View community discussion topics
- Post replies to discussions
- Search topics by keyword
- See topic activity (replies, last post date)

#### For Leaders/Admins:
- Create new discussion topics
- Pin important discussions
- Moderate inappropriate content
- Close/archive discussions

### 💳 Finance

#### For All Members:
- View membership fees in **RUB (Russian Rubles)**
- Check payment status
- See fee breakdown
- Request payment plan information

#### For Leaders/Admins:
- Track member fee payments
- Generate payment reports
- Record new payments
- Send payment reminders

### 🗂️ Documents

#### For All Members:
- Access official documents (constitution, bylaws, etc.)
- Search documents
- View document history/versions
- Download documents

#### For Leaders/Admins:
- Upload official documents
- Organize by category
- Archive old versions
- Set document visibility

### 📈 Analytics (Admin Only)

#### Available Features:
1. **Member Activity Dashboard**:
   - Total members and active members
   - Member statistics by country/program
   - Engagement metrics

2. **Activity Records**:
   - Login timestamps for all members
   - Visit frequency analysis
   - Last activity date for each member

3. **Top Active Members**:
   - Members sorted by activity level
   - Event attendance records
   - Engagement scores

4. **Inactive Members**:
   - Members not active in 30+ days
   - Contact information for outreach
   - Suggestion to re-engage or remove

5. **Activity Statistics**:
   - Daily/weekly/monthly activity trends
   - Peak activity times
   - Engagement growth charts

### ✅ Verification (Leaders/Admins Only)

#### Member Verification Process:
1. Go to "✅ Verification"
2. Review pending member applications
3. For suspicious members:
   - Click "Block" or "Remove"
   - Provide reason for removal
   - Member's account is flagged/removed

#### Managing Removed Members:
- View list of removed/blocked members
- See removal reasons
- Optionally restore members (for admins)

### 👤 Profile

#### Available to All Members:
1. **View Your Profile**:
   - Click your avatar in top-right → "Profile"
   - See all your information

2. **Edit Profile**:
   - Update bio/about section
   - Update country or program
   - View profile picture

3. **Upload Profile Picture**:
   - Click "Upload Picture"
   - Select image from computer
   - Picture is automatically compressed
   - Appear in directory and chat requests
   - See preview before saving

#### Profile Picture Features:
- **Automatic Compression**: Images optimized for fast loading
- **Avatar Generation**: System creates fallback avatar from initials
- **Gallery**: See how your profile appears to others

### 🌐 Language Switching

#### Available to All Users:
- Click language icon in top-right corner
- Choose between:
  - 🇬🇧 **English**: Complete English interface
  - 🇷🇺 **Русский**: Complete Russian interface
- All text updates instantly
- Your preference is saved

---

## Feature Guides

### Creating Your First Event (Leaders/Admins)

**Scenario**: You want to organize a study group meetup

1. Click "📅 Events" → "+ Create Event"
2. Fill in the form:
   - Title: "African Students Study Group"
   - Description: "Weekly study session for all students"
   - Date: "2026-05-21"
   - Time: "18:00"
   - Location: "Library Room 101"
   - Capacity: "20"
3. Click "Create"
4. The event appears on everyone's calendar
5. Members can now RSVP

### Verifying a New Member (Leaders/Admins)

1. Go to "✅ Verification"
2. See all pending member requests
3. Review member details
4. Click "Approve" to verify and add to active directory
5. Member receives notification

### Removing a Suspicious Member (Admins Only)

1. Go to "✅ Verification"
2. Look at "Blocked/Removed Members" section
3. Find member and click "Remove"
4. Select reason:
   - Inactive
   - Suspicious activity
   - Policy violation
   - Request to leave
5. Click "Confirm"
6. Member is removed from directory

### Creating a Group Chat (Members)

1. Go to "💬 Group Chats"
2. Click "+ Request Chat"
3. Name: "Basketball Court Regulars"
4. Description: "Organize pickup games"
5. Members: Select interested members (optional)
6. Click "Submit Request"
7. Admin reviews and approves
8. Chat becomes active and accessible

### Earning an Achievement

Achievements are awarded by admins/leaders for:
- Attending multiple events
- Outstanding community service
- Event organization
- Member engagement
- Community milestones

You can't directly earn achievements, but leaders/admins can create them for you!

### Uploading Your Profile Picture

1. Go to "👤 Profile"
2. Click "Upload Picture"
3. Select an image from your computer
4. See preview before confirming
5. Click "Save"
6. Picture appears:
   - In your profile
   - In the directory
   - In group chat requests
   - Across the platform

---

## Public Access & Landing Page (Task 9)

### Visiting the Landing Page

When you first visit the platform without logging in, you see a professional landing page featuring:

#### Landing Page Sections:
1. **Navigation Bar**:
   - Platform branding ("AFR Community")
   - Language switcher (English/Russian)
   - Login/Sign Up button

2. **Hero Section**:
   - Community welcome message
   - Quick statistics:
     - Total active members
     - Upcoming events count
     - Global community badge

3. **Tab-Based Content**:
   - **About Tab**: Mission, values, "Why Join" section
   - **Events Tab**: Preview of 5 upcoming events with details
   - **Leadership Tab**: Meet the leadership team

#### What Non-Members Can See:
- ✅ Event titles, dates, times, locations
- ✅ Event capacity and current RSVPs
- ✅ General announcements
- ✅ Leadership team member names and programs
- ❌ Member directory (members-only)
- ❌ Private discussions or internal communications
- ❌ Financial information
- ❌ Admin-only content

#### Next Steps from Landing Page:
1. Click "→ Join Us" or "Login / Sign Up" buttons
2. Create new account or login with existing credentials
3. Access full member features immediately after login

### Public Content Access

Non-members have read-only access to:
- **Public Events**: See upcoming events but cannot RSVP (need to login)
- **Community Info**: Learn about the platform's mission and values
- **Leadership**: Discover who leads the community
- **Quick Stats**: See active membership and upcoming activities

Members get full access to:
- All features above
- Event RSVP and attendance
- Member directory
- Private communications
- Document access
- Resource downloads

---

## SEO & Global Discoverability (Task 10)

### What is SEO?

SEO (Search Engine Optimization) helps your platform appear in Google, Bing, and other search engines. When someone searches for "African students Vladivostok", our platform should appear in the results!

### Our SEO Implementation

#### 1. Meta Tags in HTML
Every page includes optimized meta tags:
- **Title**: "African Student Community Platform | Vladivostok State University"
- **Description**: "Connect with African students..."
- **Keywords**: "African students, Vladivostok, community, university..."
- **Open Graph**: Enables beautiful social media sharing
- **Twitter Cards**: Optimized for tweet previews

#### 2. Structured Data (JSON-LD)
Search engines read "structured data" to understand content:
- Organization information (name, logo, description)
- Breadcrumb navigation (helps understand page hierarchy)
- FAQ schema (for Q&A pages)
- Event schema (with date, location, attendees)

#### 3. Sitemap (`public/sitemap.xml`)
Lists all important pages for search engines:
```
Homepage (priority: 1.0)
Events page (priority: 0.8)
Directory (priority: 0.7)
Leadership (priority: 0.6)
Achievements (priority: 0.6)
...etc
```

#### 4. Robots.txt (`public/robots.txt`)
Tells search engine crawlers:
- What they're allowed to index
- What they should skip (admin pages)
- Where the sitemap is located
- How fast to crawl

#### 5. Mobile Optimization
- Responsive design (works on phones, tablets, desktops)
- Fast page load times
- Touch-friendly buttons
- Clear navigation

### Search Keywords We Target

People searching for these terms should find us:
- "African students Vladivostok"
- "Community university Russia"
- "Student networking Vladivostok"
- "African student association"
- "International students organization"
- "University community platform"

### How Search Engines Rank Us

Factors that help ranking:
1. ✅ Relevant content (about African students)
2. ✅ Keywords in titles and descriptions
3. ✅ Mobile-friendly design
4. ✅ Fast page loading
5. ✅ Clear URL structure
6. ✅ Internal links between pages
7. ✅ Social media sharing potential
8. ✅ Regular content updates

### For Production Deployment

When launching on a real domain:
1. Replace `http://localhost:5176` with your domain (e.g., `africanstudents.vsu.ru`)
2. Update in:
   - `index.html` (og:url, canonical link)
   - `public/sitemap.xml` (all URLs)
   - `public/robots.txt` (sitemap URL)
   - `src/utils/seo.ts` (base URLs)

3. Submit sitemap to Google Search Console
4. Set up analytics to track traffic
5. Monitor search rankings over time

### SEO Files Created

- **`index.html`**: Enhanced with meta tags
- **`src/utils/seo.ts`**: Functions to update page metadata
- **`src/utils/sitemap.ts`**: Generate sitemaps programmatically
- **`public/sitemap.xml`**: Sitemap for search engines
- **`public/robots.txt`**: Instructions for web crawlers
- **`src/pages/LandingPage.tsx`**: Optimized landing page

### Checking SEO Performance

After deployment, check:
- Google Search Console (see how you appear in Google)
- Bing Webmaster Tools (for Bing search)
- SEO audit tools (Lighthouse, SEMrush, Ahrefs)
- Structured data validator (schema.org)

---

## Frequently Asked Questions

### General Questions

**Q: Is my data safe?**  
A: Yes! Data is stored securely in browser localStorage. The platform is designed for local development with an eye toward backend migration for production.

**Q: Can I change my registered country/program?**  
A: Yes, go to "👤 Profile" and click "Edit" to update these details.

**Q: How do I delete my account?**  
A: Contact an admin. They can remove your account from the "✅ Verification" section.

**Q: Can I use the platform offline?**  
A: Yes, once loaded, the data persists in your browser. New changes require internet connection to sync with other users.

### Events

**Q: Can I RSVP to past events?**  
A: No, you can only RSVP to upcoming events.

**Q: What happens if an event is cancelled?**  
A: All attendees receive a notification and the event moves to the "Past Events" section.

**Q: How many events can I attend?**  
A: Unlimited! Attend as many as you want.

### Achievements

**Q: How do I get achievements?**  
A: Leaders and admins create achievements for:
- Community milestones
- Member recognition
- Special occasions
- Outstanding contributions

**Q: Can I create my own achievements?**  
A: Only admins and leaders can create achievements.

**Q: Are achievements visible to other members?**  
A: Yes! All achievements are visible to the entire community.

### Group Chats

**Q: Why is my chat request pending?**  
A: An admin must review it to prevent spam. They check the name, description, and proposed members.

**Q: Can I modify a chat after it's created?**  
A: Currently, chats are created as requested. Contact an admin to add/remove members.

**Q: What if my chat request is rejected?**  
A: The reason is provided in the rejection message. You can submit a new request with modifications.

### Technical

**Q: What if I see a blank page?**  
A: Try refreshing (Ctrl+R or Cmd+R). Clear your browser cache if problems persist.

**Q: Can I use the app on mobile?**  
A: Yes! The app is responsive and works on phones, tablets, and desktops.

**Q: How do I switch between English and Russian?**  
A: Click the language icon (🇬🇧/🇷🇺) in the top-right corner.

---

## Version History & Updates

### Version 1.0.0 (Current - May 2026)

#### All Features Complete (10/10) ✅

1. ✅ **i18n Language Switching** - English/Russian fully implemented
2. ✅ **Profile Pictures** - Upload & display with compression
3. ✅ **Currency (Rubles)** - All financial displays in RUB format
4. ✅ **Admin Member Removal** - Complete moderation system
5. ✅ **Activity Tracking** - Login tracking & admin analytics
6. ✅ **Admin/Leadership Profiles** - Leadership showcase page
7. ✅ **Achievements** - Community & individual recognitions
8. ✅ **Group Chat Requests** - Full chat request workflow
9. ✅ **Public Access Layer** - Landing page with event preview
10. ✅ **SEO & Discoverability** - Full SEO optimization suite

#### Known Limitations:
- Data stored in browser localStorage (development only)
- No real email notifications (backend will add)
- No real-time chat messages (infrastructure needed)
- Limited to single browser per user

---

## Support & Feedback

For bugs, feature requests, or questions:
1. Contact your admin
2. Post in the forum
3. Email the leadership team

---

**Last Updated**: May 14, 2026  
**Platform Version**: 1.0.0  
**Language Versions**: English, Russian (Русский)

