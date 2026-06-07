# 🧪 Complete Role Hierarchy Testing Guide

## Goal
Test the new **super-admin** vs **admin** vs **member** role system with full verification

---

## 📋 Step-by-Step Testing Plan

### **Phase 1: Clean Start**

#### Step 1.1: Clear All Storage
```javascript
// Open browser DevTools (F12) → Console tab
// Copy and paste this:
localStorage.clear(); 
sessionStorage.clear(); 
location.reload();
```

**Expected**: Page refreshes, you're logged out, database is empty ✅

---

### **Phase 2: Create Super Admin (You)**

#### Step 2.1: Register as First User
- Click **Register**
- Fill in:
  - **Name**: Your Name (e.g., "Nana Wusu")
  - **Email**: Your email (e.g., "nana@example.com")
  - **Password**: Any password (min 6 chars)
  - **Country**: Ghana
  - **Program**: Computer Science
  - **Security Question**: Pick any
  - **Security Answer**: Give answer
- Click **Register**

**Expected**: You're logged in as super-admin ✅

#### Step 2.2: Verify Your Role
```javascript
// Check in browser console:
const user = JSON.parse(localStorage.getItem('currentUser'));
console.log('Your role:', user.role);
// Should print: Your role: super-admin ✅
```

#### Step 2.3: Check Sidebar Features
- You should see **🔐 Leadership** button in sidebar ✅
- You should see **🌱 Seed Data** button ✅
- You should see **📈 Analytics** button ✅

---

### **Phase 3: Create Regular Members**

#### Step 3.1: Create Member 1 (Alice)
- Click **Logout** (top right)
- Click **Register**
- Fill in:
  - **Name**: Alice Johnson
  - **Email**: alice@example.com
  - **Password**: password123
  - **Country**: Ghana
  - **Program**: Business
  - **Security Question & Answer**: Fill any
- Click **Register**

**Expected**: Alice is logged in as **member** ✅

#### Step 3.2: Verify Alice's Role
```javascript
// In console:
const user = JSON.parse(localStorage.getItem('currentUser'));
console.log('Alice role:', user.role);
// Should print: Alice role: member ✅
```

#### Step 3.3: Check Alice's Sidebar
- Alice should **NOT** see 🔐 Leadership ❌
- Alice should **NOT** see 🌱 Seed Data ❌
- Alice should **NOT** see 📈 Analytics ❌
- Alice should see basic features: Events, Directory, Announcements ✅

#### Step 3.4: Create Member 2 (Bob)
- Click **Logout**
- Click **Register**
- Fill in:
  - **Name**: Bob Smith
  - **Email**: bob@example.com
  - **Password**: password123
  - **Country**: Kenya
  - **Program**: Engineering
  - **Security Question & Answer**: Fill any
- Click **Register**

**Expected**: Bob is logged in as **member** ✅

---

### **Phase 4: Promote to Admin**

#### Step 4.1: Login as Super Admin
- Click **Logout**
- Click **Login**
- Email: nana@example.com
- Password: (your password)
- Click **Login**

**Expected**: You're back as super-admin, see 🔐 Leadership ✅

#### Step 4.2: Promote Alice to President
- Click **🔐 Leadership** in sidebar
- In the **left section** ("Promote a Member"):
  - **Choose a member dropdown**: Select "Alice Johnson (alice@example.com)"
  - **Position dropdown**: Select "President"
  - **Reason**: "Elected President 2026"
  - Click **✅ Promote to President** button

**Expected**: 
- Green success message: "✅ Alice Johnson promoted to President" ✅
- Alice appears in "👑 Current Leaders" section ✅
- Audit log shows the promotion ✅

#### Step 4.3: Promote Bob to Treasurer
- Still on 🔐 Leadership page
- **Choose a member dropdown**: Select "Bob Smith (bob@example.com)"
- **Position dropdown**: Select "Treasurer"
- **Reason**: "Elected Treasurer 2026"
- Click **✅ Promote to Treasurer**

**Expected**: 
- Green success message for Bob ✅
- Both Alice and Bob appear in "👑 Current Leaders" ✅

---

### **Phase 5: Verify Alice's New Powers (Admin)**

#### Step 5.1: Login as Alice
- Click **Logout**
- Click **Login**
- Email: alice@example.com
- Password: password123
- Click **Login**

**Expected**: Alice is logged in ✅

#### Step 5.2: Check Alice's Role Now
```javascript
// In console:
const user = JSON.parse(localStorage.getItem('currentUser'));
console.log('Alice new role:', user.role);
// Should print: Alice new role: admin ✅
```

#### Step 5.3: Check Alice's Sidebar - What She CAN See
Alice should now see:
- ✅ **🌱 Seed Data** (can create test events)
- ✅ **✅ Verification** (can verify members)
- ✅ **📈 Analytics** (can view stats)
- ✅ **⚙️ Manage Chats** (can approve group chats)

#### Step 5.4: Check Alice's Sidebar - What She CANNOT See
Alice should **NOT** see:
- ❌ **🔐 Leadership** (cannot promote/demote)

#### Step 5.5: Try to Access Leadership Page (Should Fail)
```javascript
// Try to access the page directly by setting it in sidebar
// But you won't see the button, so skip this
// Or try in console:
// This would fail because Alice is not super-admin
```

**Expected**: Alice cannot access 🔐 Leadership feature ✅

---

### **Phase 6: Verify Bob's New Powers (Admin)**

#### Step 6.1: Login as Bob
- Click **Logout**
- Click **Login**
- Email: bob@example.com
- Password: password123
- Click **Login**

**Expected**: Bob is logged in ✅

#### Step 6.2: Check Bob's Role
```javascript
// In console:
const user = JSON.parse(localStorage.getItem('currentUser'));
console.log('Bob new role:', user.role);
// Should print: Bob new role: admin ✅
```

#### Step 6.3: Check Bob's Sidebar Features
Bob should see **exactly the same** as Alice:
- ✅ 🌱 Seed Data
- ✅ ✅ Verification
- ✅ 📈 Analytics
- ✅ ⚙️ Manage Chats
- ❌ 🔐 Leadership (cannot see)

---

### **Phase 7: Verify Your Powers (Super Admin)**

#### Step 7.1: Login as Super Admin (You)
- Click **Logout**
- Click **Login**
- Email: nana@example.com
- Password: (your password)
- Click **Login**

**Expected**: You're back as super-admin ✅

#### Step 7.2: Check Your Role
```javascript
// In console:
const user = JSON.parse(localStorage.getItem('currentUser'));
console.log('Super admin role:', user.role);
// Should print: Super admin role: super-admin ✅
```

#### Step 7.3: Check Your Sidebar - You Should See EVERYTHING
You should see:
- ✅ 🌱 Seed Data
- ✅ ✅ Verification
- ✅ 📈 Analytics
- ✅ ⚙️ Manage Chats
- ✅ **🔐 Leadership** (ONLY you see this!)

#### Step 7.4: Access Leadership Page
- Click **🔐 Leadership**
- You should see:
  - Stats cards (Active Leaders, Available Members, Role Changes)
  - Promote section (to promote more members)
  - Current Leaders section (showing Alice as President, Bob as Treasurer)
  - Audit Log (showing both promotions)

**Expected**: Full access to everything ✅

---

## 📊 Role Comparison Summary

### **What You Should See:**

```
SUPER ADMIN (Nana)          ADMIN (Alice)              MEMBER (Bob - before)
═══════════════════════════  ══════════════════════════  ════════════════════
🔐 Leadership ✅            🌱 Seed Data ✅            📅 Events only
  └─ Promote/Demote         ✅ Verification ✅         👥 Directory
  └─ View Audit Logs        📈 Analytics ✅            📢 Announcements
  └─ Assign Positions       ⚙️ Manage Chats ✅         💬 Chat Requests
  └─ Track History                                     🏆 Achievements
                                                        💭 Forum
🌱 Seed Data ✅             🔐 Leadership ❌           
✅ Verification ✅          (Cannot access)             
📈 Analytics ✅             
⚙️ Manage Chats ✅          
```

---

## ✅ Verification Checklist

After completing all phases, verify:

- [ ] You are super-admin with `role: 'super-admin'`
- [ ] Alice is admin with `role: 'admin'`
- [ ] Bob is admin with `role: 'admin'`
- [ ] Only you see 🔐 Leadership button
- [ ] Alice and Bob see admin features but NOT 🔐 Leadership
- [ ] Audit log shows both promotions with reasons
- [ ] When Alice/Bob login, they DON'T see 🔐 Leadership
- [ ] You can still see all audit logs on 🔐 Leadership page
- [ ] You can demote Alice/Bob and they lose admin powers

---

## 🎯 Key Differences

| Item | Super Admin | Admin | Member |
|------|-----------|-------|--------|
| **Role Value** | `'super-admin'` | `'admin'` | `'member'` |
| **Can Create Events** | ✅ | ✅ | ❌ |
| **Can Seed Test Data** | ✅ | ✅ | ❌ |
| **Can Verify Members** | ✅ | ✅ | ❌ |
| **Can Manage Roles** | ✅ | ❌ | ❌ |
| **Can View Audit Logs** | ✅ | ❌ | ❌ |
| **Can Assign Positions** | ✅ | ❌ | ❌ |
| **Sees 🔐 Leadership** | ✅ | ❌ | ❌ |

---

## 💡 Testing Tips

1. **Use Browser Console** (F12) to check roles quickly
2. **Test in Incognito/Private Mode** if you want parallel sessions
3. **Check Sidebar** visually for feature visibility
4. **View Audit Log** to verify all changes are tracked
5. **Try Logout/Login** cycles to ensure persistence

---

## 🚀 Once Verified

Once you confirm everything works:
1. You have complete control as super-admin
2. You can promote/demote anyone anytime
3. Promoted admins can't exceed your power
4. Complete audit trail of all changes
5. System ready for production! ✅

