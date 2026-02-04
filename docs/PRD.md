# TimeBlock - Product Requirements Document

## Overview
TimeBlock is a Progressive Web App (PWA) for personal time tracking. Users can log how they spend their time in customizable time blocks, categorize activities, and view statistics to understand their time usage patterns.

## Goals
- Help users become more aware of how they spend their time
- Provide simple, frictionless time logging experience
- Offer insightful visualizations of time usage patterns
- Work offline and across devices

## Target Users
- Students tracking study time vs leisure
- Professionals monitoring work-life balance
- Anyone wanting to understand their daily time allocation

---

## Core Features

### 1. Time Block System
**Description**: Time is divided into configurable blocks (15min, 30min, 1hr, 2hr) starting from midnight.

**Requirements**:
- User can select their preferred block duration in settings
- Blocks are displayed in a Google Calendar-inspired vertical timeline
- Current time block is visually highlighted
- Past blocks show logged status (logged vs unlogged)

### 2. Category System
**Description**: Activities are organized into major categories and subcategories.

**Default Categories**:
| Category | Color | Subcategories |
|----------|-------|---------------|
| Work | Blue (#3B82F6) | Email, Meetings, Deep Work, Admin, Other |
| Class | Purple (#8B5CF6) | Lecture, Study, Homework, Group Project, Other |
| Social | Green (#22C55E) | Friends, Family, Events, Other |
| Personal | Orange (#F97316) | Errands, Hobbies, Entertainment, Other |
| Health | Red (#EF4444) | Exercise, Meal, Sleep, Other |
| Other | Gray (#6B7280) | Miscellaneous |

**Requirements**:
- Users can add, edit, and delete categories
- Users can add, edit, and delete subcategories
- Each category has a color for visual identification
- "Other" option allows custom text input

### 3. Time Logging
**Description**: After each time block ends, prompt user to log what they did.

**Logging Flow**:
1. Time block ends → notification/prompt appears
2. User selects major category from dropdown
3. User selects subcategory (or enters custom "Other")
4. Optional: Add a note
5. Save entry

**Requirements**:
- In-app modal prompt when block ends (if app is open)
- Optional browser push notifications
- Can log past unlogged blocks by clicking on them
- Can edit already-logged blocks
- If user doesn't log, previous task is assumed to continue (for stats)

### 4. Statistics View
**Description**: Visualize time usage with charts and lists.

**Requirements**:
- Pie chart showing time distribution by category
- Click category slice to see subcategory breakdown
- Time period filters: 1 day, 3 days, 1 week, 1 month
- List view showing hours per category/subcategory
- Percentage calculations

### 5. User Authentication
**Description**: Users can create accounts to save and sync their data.

**Requirements**:
- Email/password registration and login
- Google sign-in option
- Data persisted to Firebase Firestore
- Session persistence across browser refreshes

### 6. PWA Capabilities
**Requirements**:
- Installable to home screen
- Works offline (viewing existing data)
- Push notifications for block reminders

---

## Technical Specifications

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **Charts**: Recharts
- **PWA**: vite-plugin-pwa

### Data Models

```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  timeBlockDuration: 15 | 30 | 60 | 120;
  categories: Category[];
  createdAt: Timestamp;
  notificationsEnabled: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string;
  subcategories: Subcategory[];
  isDefault: boolean;
}

interface TimeEntry {
  id: string;
  userId: string;
  categoryId: string;
  subcategoryId: string;
  customSubcategory?: string;
  startTime: Timestamp;
  endTime: Timestamp;
  note?: string;
  createdAt: Timestamp;
}
```

---

## UI/UX Guidelines

### Design Principles
- **Minimalist**: Clean, uncluttered interface
- **Fast**: Quick to log, minimal friction
- **Informative**: Clear visual hierarchy
- **Accessible**: Works on mobile and desktop

### Inspiration
- Google Calendar (vertical timeline layout)
- Toggl (simple category selection)
- RescueTime (statistics visualization)

---

## Success Metrics
- User can log a time block in under 5 seconds
- App loads in under 2 seconds
- Works offline for viewing data
- Installable as PWA on mobile devices

---

## Future Enhancements (Post-MVP)
- Weekly/monthly email reports
- Goals and targets (e.g., "8 hours of deep work per week")
- Data export (CSV, JSON)
- Team/shared categories
- Integrations (Google Calendar, Notion)
- Dark mode
