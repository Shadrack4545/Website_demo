# Complete Demo Testing Guide - Admin & Member Testing

## 🎯 Objectives
1. **As Admin**: Seed test events into the database
2. **As Admin**: Verify events display on Predictions page
3. **As Member**: View predictions and add RSVP

---

## 📋 Part 1: Test as ADMIN User

### Step 1: Check Current Login Status
- Open http://localhost:5173 in your browser
- Note your current user role (shown in sidebar as "role: X")

### Step 2: Create Admin Account (If needed)
If you're not logged in as admin:
1. Log out (click profile → logout)
2. Go to Login page
3. Register a new account with admin privileges
   - **OR** check browser localStorage for existing admin accounts
4. Log back in as admin

### Step 3: Access Seed Data Page
1. Look in the **sidebar** for a new option: **🌱 Seed Data** (only visible to admins/leaders)
2. Click on it
3. You should see:
   - "Admin: Seed Test Events" heading
   - Info cards showing "3 Test Events", "205 Expected RSVPs", "83% Model Accuracy"
   - List of 3 events to be created
   - Green "Populate Test Events" button

### Step 4: Seed the Events
1. Click **"Populate Test Events"** button
2. Wait for success message (should appear in ~1 second)
3. You should see: **✅ Successfully created 3 test events!**

### Step 5: Verify Events Were Created
1. Navigate to **📅 Events** page (from sidebar)
2. You should see 3 events listed:
   - African Day Celebration (June 15, 2026 at 6:00 PM)
   - Students Day Celebration (June 20, 2026 at 7:00 PM)
   - Movie Night (June 25, 2026 at 8:00 PM)

### Step 6: Test Predictions as Admin
1. Navigate to **🔮 Predictions** page
2. Select **African Day Celebration** from dropdown
3. You should see:
   - Event details card
   - ML predictions for each student
   - Prediction stats: Total Students, Predicted Attendees, Predicted Rate
   - Model confidence levels for each prediction

---

## 👥 Part 2: Test as MEMBER User

### Step 1: Log In as Different User (Member)
1. Click on your **profile icon** (top right)
2. Click **"Log Out"**
3. On Login page:
   - Create NEW account with member role (or use existing member)
   - Make sure role is **NOT** admin/leader
4. Log in

### Step 2: Verify Member Cannot Access Seed Data
1. Look at **sidebar**
2. **🌱 Seed Data** should **NOT** be visible (admin-only)
3. You should still see: Events, Predictions, etc.

### Step 3: Access Predictions Page
1. Click **🔮 Predictions** in sidebar
2. You should see:
   - Event selector dropdown with 3 events
   - Information: "205 students expected to attend across all events"
   - ML model details (accuracy, training data)

### Step 4: View Event Predictions
1. Select **"African Day Celebration"** from dropdown
2. You should see:
   - **Event Stats Card**: Shows event name, date, location, capacity
   - **Attendance Stats**: 
     - Total students: 29
     - Predicted attendees: ~18 (based on model)
     - Predicted rate: ~63%
   - **Predictions Table**: Shows each student with:
     - Name
     - Prediction (Attending / Not Attending)
     - Confidence (Very High / High / Medium / Low)
     - Model probability percentage

### Step 5: Test Dropdown Filtering
1. Select **"Students Day Celebration"** 
2. Verify table updates with different predictions
3. Select **"Movie Night"**
4. Verify table updates again

### Step 6: Test Table Features
1. Try **sorting** (click column headers if available)
2. Try **filtering** (if search box exists)
3. Scroll through predictions table

### Step 7: Test RSVP Functionality
1. Look for **RSVP** buttons or options in the predictions view
2. Click to add RSVP to an event
3. Your RSVP status should update

### Step 8: Switch Languages (If multilingual)
1. Look for language selector
2. Switch to **Russian** (if available)
3. Verify text translates (especially "🔮 Predictions")
4. Switch back to **English**

---

## ✅ Success Checklist

### Admin Testing
- [ ] Can see "🌱 Seed Data" in sidebar
- [ ] Seed Data page loads successfully
- [ ] "Populate Test Events" button creates 3 events
- [ ] Events appear on Events page
- [ ] Predictions page shows all 3 events in dropdown
- [ ] ML predictions display for each student
- [ ] Prediction stats show reasonable numbers (~63% attendance)

### Member Testing
- [ ] Cannot see "🌱 Seed Data" in sidebar (admin-only)
- [ ] Can access Predictions page
- [ ] Can select events from dropdown
- [ ] Predictions table shows 29 students per event
- [ ] Table displays prediction confidence levels
- [ ] Can switch between events
- [ ] Can RSVP to events
- [ ] Language switching works (if configured)

### Model Integration
- [ ] Flask server is running on localhost:5000
- [ ] Predictions are coming from Flask backend (check browser DevTools Network tab)
- [ ] Prediction probabilities are between 0-1
- [ ] Confidence levels map correctly (Very High ≥80%, High ≥60%, Medium ≥40%, Low <40%)
- [ ] Attended students show higher probability scores

---

## 🐛 Troubleshooting

### Issue: "🌱 Seed Data" not visible in sidebar
**Solution**: 
- Make sure you're logged in as user with `role: admin` or `role: leader`
- Check sidebar for role display
- Refresh page (F5)

### Issue: Seed button doesn't work / no success message
**Solution**:
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab - verify request to create event was successful
- Check that createEvent function is working

### Issue: Predictions page shows "No events"
**Solution**:
- Go to Events page first to verify 3 events exist
- Refresh Predictions page (F5)
- Check browser localStorage: Open DevTools → Application → LocalStorage
- Look for `EVENTS` key with 3 event objects

### Issue: Predictions showing as empty or all same value
**Solution**:
- Verify Flask server is running: http://localhost:5000/api/health
- Check Flask terminal for errors
- Verify trained model file exists: `ml_backend/trained_model.pkl`
- Open browser DevTools → Network tab, try selecting event
- Check response from `/api/batch_predict` endpoint

### Issue: Language not switching
**Solution**:
- Check i18n configuration
- Verify translation keys exist for "eventPredictor" namespace
- Check browser console for i18n errors

---

## 🔍 Advanced: Check Backend Communication

### Verify Flask API is responding:
```bash
curl http://localhost:5000/api/health
```
Expected response: `{"status":"healthy"}`

### Verify Model Info:
```bash
curl http://localhost:5000/api/model_info
```

### Check Feature Importance:
```bash
curl http://localhost:5000/api/feature_importance
```

---

## 📊 Expected ML Prediction Results

Based on the trained model (83.3% accuracy):

**African Day Celebration**
- High attendance expected: ~63% (18-19 students)
- Top predictor: Previous attendance rate
- Event type: Social (incentive + cultural appeal)

**Students Day Celebration**
- Medium-high attendance: ~60% (17-18 students)
- Event type: Community (important occasion)
- No incentive (lower boost)

**Movie Night**
- Medium attendance: ~58% (16-17 students)
- Event type: Entertainment
- Evening event (smaller capacity)

Individual predictions vary by:
1. Student's historical attendance rate (60.8% feature importance)
2. Academic load (24.6% feature importance)
3. Student's indicated RSVP status (used in training)
4. Event incentives & timing

---

## 🎓 Presentation Points for Pre-Defense

1. **Full-Stack Integration**:
   - Frontend UI (React/TypeScript)
   - ML Backend (XGBoost)
   - Flask API (REST endpoints)
   - Real student data (29 students, 87 RSVP records)

2. **Model Performance**:
   - Trained on real community data
   - 83.3% accuracy on test set
   - 90.9% recall (catches most attendees)
   - 96.1% ROC-AUC (excellent discrimination)

3. **Feature Engineering**:
   - 8 features extracted per RSVP
   - Historical attendance rate (best predictor)
   - Academic load (2nd best)
   - Event characteristics (type, incentive, timing)

4. **Admin Controls**:
   - Admin-only seed page for demo data
   - Easy event management
   - Clear role-based access

5. **Member Experience**:
   - Clean predictions interface
   - Supports decision-making for RSVPs
   - Transparent confidence levels

---

## 🚀 Next Steps (After Defense)

1. **Data Collection**: Continue collecting real RSVPs throughout semester
2. **Model Retraining**: Monthly retraining with new data
3. **Feedback Loop**: Track actual vs predicted attendance
4. **Production**: Deploy to real server
5. **Monitoring**: Track model performance over time

