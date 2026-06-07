/**
 * seed-demo.js
 *
 * Run this with Node to print a browser JS snippet that seeds localStorage
 * Paste the printed snippet into the browser console and press Enter to populate demo data.
 *
 * Usage:
 *  node scripts/seed-demo.js > seed-snippet.txt
 *  Then open seed-snippet.txt and paste into browser console OR run the printed snippet directly.
 */

const now = Date.now();

const demo = {
  users: [
    {
      id: 'user-super-1',
      name: 'Nana Wusu',
      email: 'nana@example.com',
      password: 'password123',
      country: 'Ghana',
      program: 'Computer Science',
      role: 'super-admin',
      createdAt: now - 10000,
      updatedAt: now - 10000,
    },
    {
      id: 'user-admin-1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'password123',
      country: 'Ghana',
      program: 'Business',
      role: 'admin',
      createdAt: now - 9000,
      updatedAt: now - 9000,
    },
    {
      id: 'user-member-1',
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: 'password123',
      country: 'Kenya',
      program: 'Engineering',
      role: 'member',
      createdAt: now - 8000,
      updatedAt: now - 8000,
    },
  ],
  currentUser: {
    id: 'user-super-1',
    name: 'Nana Wusu',
    email: 'nana@example.com',
    role: 'super-admin',
    createdAt: now - 10000,
    updatedAt: now - 10000,
  },
  directoryMembers: [
    {
      id: 'member-1',
      userId: 'user-super-1',
      name: 'Nana Wusu',
      email: 'nana@example.com',
      country: 'Ghana',
      program: 'Computer Science',
      joinedAt: now - 10000,
      feePaid: false,
      lastActive: now - 2000,
      interests: ['community', 'ml'],
      verificationStatus: 'verified',
      membershipStatus: 'active',
      updatedAt: now - 10000,
    },
    {
      id: 'member-2',
      userId: 'user-admin-1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      country: 'Ghana',
      program: 'Business',
      joinedAt: now - 9000,
      feePaid: false,
      lastActive: now - 3000,
      interests: ['leadership'],
      verificationStatus: 'verified',
      membershipStatus: 'active',
      updatedAt: now - 9000,
    },
    {
      id: 'member-3',
      userId: 'user-member-1',
      name: 'Bob Smith',
      email: 'bob@example.com',
      country: 'Kenya',
      program: 'Engineering',
      joinedAt: now - 8000,
      feePaid: false,
      lastActive: now - 4000,
      interests: ['events'],
      verificationStatus: 'pending',
      membershipStatus: 'active',
      updatedAt: now - 8000,
    },
  ],
  events: [
    {
      id: 'event-1',
      title: 'Welcome Mixer',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0,10),
      time: '18:00',
      status: 'upcoming',
      rsvps: { 'user-super-1': 'attending', 'user-admin-1': 'attending', 'user-member-1': 'maybe' },
      createdAt: now - 7000,
      updatedAt: now - 7000,
    },
    {
      id: 'event-2',
      title: 'Study Group: ML Basics',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0,10),
      time: '16:00',
      status: 'upcoming',
      rsvps: { 'user-super-1': 'attending', 'user-admin-1': 'attending' },
      createdAt: now - 6000,
      updatedAt: now - 6000,
    },
  ],
  roleManagementState: {
    auditLogs: [],
    leadershipTerms: [],
    currentTermId: undefined,
  },
};

const snippet = `// Demo seed snippet - paste into browser console and press Enter\n(function(){\n  localStorage.clear();\n  localStorage.setItem('users', JSON.stringify(${JSON.stringify(demo.users)}));\n  localStorage.setItem('currentUser', JSON.stringify(${JSON.stringify(demo.currentUser)}));\n  localStorage.setItem('directoryMembers', JSON.stringify(${JSON.stringify(demo.directoryMembers)}));\n  localStorage.setItem('events', JSON.stringify(${JSON.stringify(demo.events)}));\n  localStorage.setItem('roleManagementState', JSON.stringify(${JSON.stringify(demo.roleManagementState)}));\n  console.log('Demo data written. Reloading...');\n  location.reload();\n})();`;

console.log(snippet);
