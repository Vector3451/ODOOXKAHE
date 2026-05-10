<div align="center">

## 📖 Contents

[🌐 Vision](#-overall-vision) · [🎯 Mission](#-mission) · [❗ Problem](#-problem-statement) · [📱 Platform](#-platform-support) · [✨ Features](#-application-screens--features) · [🗄️ Database](#%EF%B8%8F-database-architecture) · [🛠️ Stack](#%EF%B8%8F-tech-stack) · [🎨 Design](#-uiux-design-system) · [⚙️ Setup](#%EF%B8%8F-local-installation) · [🗺️ Mockup](#%EF%B8%8F-mockup--wireframe) · [👥 Team](#-the-team)

</div>

---

## 🌐 Overall Vision

The overarching vision for **Traveloop** is to become a **personalized, intelligent, and collaborative travel platform** — transforming the way individuals plan and experience the world.

We envision a place where users can:

- 🗺️ **Explore global destinations** with rich, curated information
- 📅 **Visualize complete journeys** through structured, interactive itineraries
- 💡 **Make cost-effective decisions** backed by real-time budget intelligence
- 🤝 **Share travel plans** within a growing, inspired community of explorers

> Traveloop is built on one belief — **travel planning should be as exciting as the trip itself**.

---

## 🎯 Mission

Our mission for the **Odoo × KAHE Hackathon '26** is to build a **user-centric, fully responsive application** that simplifies multi-city travel planning by providing travelers with powerful yet intuitive tools:

| &nbsp; | Goal | What It Delivers |
|:------:|:-----|:-----------------|
| ➕ | **Add & Manage Stops** | Create, reorder, and remove travel stops and durations effortlessly |
| 🔍 | **Explore Cities & Activities** | Discover destinations and experiences tailored to your interests |
| 💰 | **Estimate Budgets Automatically** | Smart cost estimates across transport, stay, meals, and activities |
| 📅 | **Visualize Timelines** | See your full journey in an interactive, day-wise calendar |
| 🌐 | **Share Trip Plans** | Publish publicly or send private links to friends and family |

---

## ❗ Problem Statement

Planning multi-city travel is historically **complex, fragmented, and stressful**. Travelers juggle disconnected tools — spreadsheets for budgets, browser tabs for research, calendar apps for dates, and note apps for reminders. No single platform unifies it all.

**The Challenge:** Build a complete travel planning application where users can:

```
✅  Create    →  Customized multi-city itineraries
✅  Assign    →  Travel dates, activities, and budgets per stop
✅  Discover  →  Activities and destinations via intelligent search
✅  Receive   →  Cost breakdowns and visual calendars for full trip visibility
✅  Share     →  Plans publicly or privately with friends and family
```

The application must use a **relational database** to store complex travel data — itineraries, stops, activities, and expenses — while supporting **dynamic interfaces** that adapt to each user's trip flow.

---

## 📱 Platform Support

Traveloop is **fully responsive** — a seamless experience on both desktop and mobile.

| 💻 Desktop Experience | 📱 Mobile Experience |
|:----------------------|:---------------------|
| Full planning workspace with expanded layouts | Touch-friendly interface for on-the-go access |
| Side-by-side activity browsing and itinerary editing | Collapsible panels and mobile-first navigation |
| Rich chart visualizations for budget analysis | Compact card views for trips and activities |
| Drag-and-drop itinerary reordering | Swipe-friendly interactions and gesture support |

---

## ✨ Application Screens & Features

Traveloop is built across **14 purpose-built screens**, each covering a specific stage of the travel planning journey.

---

### 🔐 01 · Login / Signup

**The secure entry point** — allows users to create a new account or access their existing one.

**Purpose:** Authenticate users so that all trip data, preferences, and history remain private and personalized.

| Component | Description |
|:----------|:------------|
| 📧 Email & Password Fields | Input fields with real-time inline validation |
| 🔑 Login Button | Authenticates the user and redirects to the Dashboard |
| 📝 Signup Link | Navigates new users to the account registration form |
| 🔓 Forgot Password | Initiates a secure account recovery flow via email |
| ⚠️ Form Validation | Clear, friendly error messages for invalid inputs |
| 📱 Responsive Layout | Adapts cleanly across all screen sizes and orientations |

---

### 🏠 02 · Dashboard / Home

**The central hub** — the first screen after login, giving a complete overview of travel activity at a glance.

**Purpose:** Enable users to quickly navigate to existing trips, discover destinations, and take immediate action.

| Component | Description |
|:----------|:------------|
| 👋 Welcome Message | Personalized greeting with the user's name |
| 🗂️ Recent Trips | Summary cards of recent and upcoming trips |
| ➕ Plan New Trip | Prominent CTA directing users to the Create Trip screen |
| 🌍 Recommended Destinations | Curated city suggestions and travel inspiration |
| 💰 Budget Highlights | Quick snapshot of spending across active trips |
| 🔔 Notifications | Upcoming trip reminders and over-budget alerts |

---

### ✏️ 03 · Create Trip

**The starting point for every journey** — an intuitive form that captures all essential details to kick off a new trip.

**Purpose:** Begin building a personalized travel plan by collecting core trip metadata before entering the Itinerary Builder.

| Component | Description |
|:----------|:------------|
| 🏷️ Trip Name | A descriptive title for the journey |
| 📅 Start & End Dates | Interactive date picker to define the trip duration |
| 📝 Trip Description | Free-text field for travel goals, themes, or personal notes |
| 🖼️ Cover Photo Upload *(Optional)* | Dropzone to personalize the trip card with a custom image |
| 💾 Save Button | Creates the trip and redirects to the Itinerary Builder |
| ✅ Field Validation | Ensures all required fields are complete before saving |

---

### 📋 04 · My Trips (Trip List)

**Personal trip management hub** — a complete list of all trips created by the user, past and upcoming.

**Purpose:** Give users a single, organized place to access and manage all their travel plans without friction.

| Component | Description |
|:----------|:------------|
| 🃏 Trip Cards | Show name, cover photo, date range, destination count, and status |
| ✏️ Edit | Opens the trip in the Itinerary Builder for modification |
| 👁️ View | Opens the read-only Itinerary View |
| 🗑️ Delete | Removes the trip after a confirmation prompt |
| 🔍 Search & Filter | Sort and filter trips by date, destination, or current status |

---

### 🗺️ 05 · Itinerary Builder

**The core planning workspace** — an interactive interface where users build their full trip, stop by stop, day by day.

**Purpose:** Allow users to construct a complete, day-wise travel plan by adding cities, assigning dates, and attaching activities to each stop.

| Component | Description |
|:----------|:------------|
| ➕ Add Stop | Adds a new city or destination to the itinerary |
| 🏙️ City Selector | Search and select cities to assign to each stop |
| 📅 Date Assignment | Define arrival and departure dates per stop |
| 🎯 Activity Assignment | Browse and attach activities to specific days at each stop |
| 🔄 Reorder Stops | Drag and drop to rearrange the order of the journey |
| 📌 Stop Summary | Collapsible view of days, activities, and estimated cost per stop |
| 💾 Auto-Save | Continuous saving to prevent data loss during planning |

---

### 📆 06 · Itinerary View

**The read-only trip overview** — a polished visual representation of the completed plan, built for reviewing and sharing.

**Purpose:** Let users and invited guests review the full trip in a structured, clean format without the risk of accidental edits.

| Component | Description |
|:----------|:------------|
| 🗓️ Day-Wise Layout | Each day is a distinct section with its own timeline |
| 🏙️ City Headers | Clear labels indicating which city each day belongs to |
| 🎯 Activity Blocks | Cards showing activity name, scheduled time, and estimated cost |
| 🔀 View Mode Toggle | Switch between **Calendar View** and **List View** |
| 🖨️ Print / Export | Print-friendly layout for offline reference |

---

### 🔎 07 · City Search

**Destination discovery tool** — helps users find and research cities to add to their travel plans.

**Purpose:** Enable users to discover cities with key travel metadata and seamlessly add them as stops in the itinerary.

| Component | Description |
|:----------|:------------|
| 🔍 Search Bar | Real-time city search with instant auto-suggestions |
| 🌆 City Result Cards | Show name, country, region, popularity, and cost index |
| 📌 Add to Trip | Instantly adds the city as a new stop in the active itinerary |
| 🗂️ Filters | Narrow results by country, region, or estimated cost range |
| 📖 City Detail Panel | Expandable view with city description and top activity previews |

---

### 🎭 08 · Activity Search

**Experience discovery engine** — helps users browse and select activities for each destination on their trip.

**Purpose:** Enrich trips with curated local experiences — sightseeing, food tours, cultural events, adventure activities, and more.

| Component | Description |
|:----------|:------------|
| 🏷️ Activity Filters | Filter by type (sightseeing, food, culture, adventure), cost, and duration |
| 🃏 Activity Cards | Show name, category, cost estimate, and duration at a glance |
| 🖼️ Quick View Panel | Detailed description and images on tap or click |
| ➕ Add Button | Adds the activity directly to a selected stop in the itinerary |
| ➖ Remove Button | Removes a previously added activity from the plan |
| 🔍 Keyword Search | Find specific activities by name or interest category |

---

### 💰 09 · Trip Budget & Cost Breakdown

**Financial intelligence dashboard** — a comprehensive view of the estimated costs across the entire trip.

**Purpose:** Help travelers stay informed about spending, plan effectively, and avoid budget overruns before they happen.

| Component | Description |
|:----------|:------------|
| 🥧 Donut / Pie Chart | Visual cost breakdown: Transport · Stay · Activities · Meals |
| 📊 Bar Chart | Daily cost comparison across the full trip duration |
| 📈 Average Cost Per Day | Automatically calculated and prominently displayed |
| 🔴 Over-Budget Alerts | Highlighted warnings for days or categories exceeding the limit |
| 💵 Total Estimated Cost | Sum of all planned expenses across every stop |
| ✏️ Budget Input | Set an overall trip budget to track against estimated spending |

---

### 🎒 10 · Packing Checklist

**Smart packing assistant** — a per-trip checklist that keeps travelers organized so nothing important is left behind.

**Purpose:** Help travelers manage what needs to be packed, track progress, and reuse the checklist for future trips.

| Component | Description |
|:----------|:------------|
| ➕ Add Items | Type in custom items to add to the packing list |
| ✅ Mark as Packed | Check off items with a visual progress indicator |
| 🗑️ Remove Items | Delete items that are no longer needed |
| 🗂️ Category Groups | Clothing · Documents · Electronics · Toiletries · Medications · Misc |
| 📊 Progress Bar | Shows the percentage of items already packed at a glance |
| 🔄 Reset Checklist | Clear all checked items to reuse the list for another trip |

---

### 🌐 11 · Shared / Public Itinerary View

**Social sharing and inspiration hub** — a publicly accessible version of an itinerary that can be shared with anyone.

**Purpose:** Allow users to share travel plans for inspiration, and let others copy and adapt the trip for their own use.

| Component | Description |
|:----------|:------------|
| 🔗 Unique Public URL | A shareable link accessible to anyone, no login required |
| 📋 Itinerary Summary | Full trip displayed in a clean, read-only format |
| 📑 Copy Trip | Logged-in users can clone the itinerary into their own account |
| 📣 Social Media Sharing | Quick-share for WhatsApp, Twitter/X, Facebook, and clipboard copy |
| 🔒 Read-Only View | Visitors can browse but cannot edit or modify the itinerary |
| 👁️ View Count | Shows how many people have visited the shared link |

---

### 👤 12 · User Profile / Settings

**Account management center** — where users control personal information, preferences, and account security.

**Purpose:** Enable users to keep their profile accurate, personalize their experience, and manage privacy settings.

| Component | Description |
|:----------|:------------|
| ✏️ Editable Profile Fields | Update full name, profile photo, and email address |
| 🌏 Language Preference | Select the preferred display language for the app |
| 📌 Saved Destinations | View and manage bookmarked cities for future trips |
| 🔐 Change Password | Secure password update with current password confirmation |
| 🔔 Notification Preferences | Control trip reminders and budget alert settings |
| 🗑️ Delete Account | Permanently remove the account with a data warning and confirmation |

---

### 📓 13 · Trip Notes / Journal

**In-app travel journal** — a lightweight note-taking tool tied directly to trips and individual stops.

**Purpose:** Let travelers capture important details — hotel check-in info, confirmation numbers, local contacts, or daily reminders — without ever leaving the app.

| Component | Description |
|:----------|:------------|
| ➕ Add Note | Create a new note linked to a specific trip or stop |
| ✏️ Edit Note | Update any existing note at any time |
| 🗑️ Delete Note | Remove notes that are no longer needed |
| 🕒 Timestamp Display | Each note shows when it was created or last edited |
| 📋 Notes List View | All notes sorted by date, most recent at the top |
| 🔍 Search Notes | Quickly find specific notes by keyword |

---

### 📊 14 · Admin / Analytics Dashboard *(Optional — Must)*

**Platform command center** — an admin-only interface for monitoring the health, usage trends, and growth of Traveloop.

**Purpose:** Give administrators the data and tools needed to track user behavior, identify popular content, and make informed product decisions.

| Component | Description |
|:----------|:------------|
| 📈 Platform Overview | Total trips, active users, public shares, and new signups |
| 🏙️ Top Destinations Chart | Most frequently added cities across all user trips |
| 🎭 Top Activities Chart | Most popular activities added by users platform-wide |
| 👥 User Management Table | List of registered users with account details and status |
| 📉 Engagement Stats | Session frequency, feature usage rates, and retention metrics |
| 🛡️ Admin Controls | Tools to suspend or remove user accounts when necessary |

---

## 🗄️ Database Architecture

Traveloop uses a **relational database** engineered to handle complex, interconnected travel data with integrity and efficiency.

<div align="center">

```
              ┌──────────────────┐
              │    👤  Users     │
              └────────┬─────────┘
                       │ owns
              ┌────────▼─────────┐
              │    ✈️  Trips     │
              └────────┬─────────┘
                       │ contains
           ┌───────────▼───────────┐
           │      📍  Stops        │
           └──┬──────────────┬─────┘
              │              │
   ┌──────────▼───┐    ┌──────▼──────────┐
   │ 🎭 Activities│    │  💰 Expenses    │
   └──────────────┘    └─────────────────┘
              │
       ┌──────▼─────────┐
       │   📝 Notes     │
       └────────────────┘
```

</div>

| Table | Role |
|:------|:-----|
| 👤 `Users` | Account credentials, profile info, and preferences |
| ✈️ `Trips` | Each trip — name, dates, description, and total budget |
| 📍 `Stops` | Individual city stops — ordered, date-ranged, linked to a trip |
| 🎭 `Activities` | Activities per stop — cost, duration, type, and description |
| 💰 `Expenses` | Financial entries per stop (transport, stay, meals, activities) |
| 📝 `Notes` | User-written notes tied to a specific trip or stop |

---

## 🛠️ Tech Stack

<div align="center">

### Frontend

[![React](https://skillicons.dev/icons?i=react)](https://reactjs.org)
[![Vite](https://skillicons.dev/icons?i=vite)](https://vitejs.dev)
[![Tailwind](https://skillicons.dev/icons?i=tailwind)](https://tailwindcss.com)
[![TypeScript](https://skillicons.dev/icons?i=ts)](https://www.typescriptlang.org)

</div>

| Technology | Role |
|:-----------|:-----|
| ⚛️ **React.js + Vite** | Component-based UI with fast hot-reload development builds |
| 🎨 **Tailwind CSS** | Utility-first responsive design system for consistent styling |
| 🧩 **shadcn/ui + Radix UI** | Accessible, composable, and fully customizable UI primitives |
| 🖼️ **Lucide React** | Clean, consistent icon set used throughout the application |
| 📊 **Recharts** | Interactive pie, donut, and bar chart visualizations for the budget screen |
| 🔄 **React Context API** | Global state management using `useState` and `useEffect` |

<div align="center">

### Backend & Database

[![Node](https://skillicons.dev/icons?i=nodejs)](https://nodejs.org)
[![PostgreSQL](https://skillicons.dev/icons?i=postgresql)](https://postgresql.org)

</div>

| Technology | Role |
|:-----------|:-----|
| 🏗️ **Odoo Integration** | Backend business logic, data management, and user administration |
| 🔌 **RESTful API** | Structured HTTP endpoints for all frontend ↔ backend communication |
| 🗄️ **Relational Database** | Stores users, trips, stops, activities, expenses, and notes |

---

## 🎨 UI/UX Design System

### 🎨 Color Palette

| Swatch | Name | Hex | Usage |
|:------:|:-----|:----|:------|
| 🔵 | Ocean Blue | `#2563eb` | Primary buttons, links, and interactive elements |
| 🟠 | Warm Coral | `#f97316` | Call-to-action highlights and energetic accents |
| ⚪ | Crisp Slate | `#f8fafc` | Page backgrounds — light and breathable feel |
| ⚫ | Deep Charcoal | `#1e293b` | Body text and high-contrast headings |
| 🟢 | Success Green | `#22c55e` | Packed items, within-budget states, confirmations |
| 🔴 | Alert Red | `#ef4444` | Over-budget warnings, validation errors, destructive actions |

### ✍️ Design Principles

| Principle | Application |
|:----------|:------------|
| 📐 **8px Grid System** | Consistent spacing across all components and layouts |
| 🃏 **Card-Based Layouts** | Related information grouped cleanly without visual clutter |
| 🔢 **Tabular Numerals** | Monospaced numbers used in all budget screens for clean decimal alignment |
| 📦 **Progressive Disclosure** | Complex data hidden behind expandable sections to reduce cognitive load |
| 📱 **Mobile-First** | Every screen is designed for mobile first, then scaled up for desktop |

---

## ⚙️ Local Installation

**Prerequisites:** Node.js v18+, npm

```bash
# 1️⃣  Clone the repository
git clone https://github.com/Vector3451/ODOOXKAHE.git

# 2️⃣  Move into the project directory
cd ODOOXKAHE

# 3️⃣  Install all dependencies
npm install

# 4️⃣  Start the development server
npm run dev
```

Open your browser at **`http://localhost:5173`**

> 💡 If you hit dependency conflicts: `npm install --force`

---

## 🗺️ Mockup / Wireframe

> View the full interactive UI mockup covering all 14 screens — layout, navigation flow, and component placement across desktop and mobile:

<div align="center">

**👉 [Open Interactive Mockup on Excalidraw](https://link.excalidraw.com/l/65VNwvy7c4X/22o30WE3bE4)**

</div>

---

## 👥 The Team

<div align="center">

> 🏆 Built with dedication for the **Odoo × KAHE Coimbatore Hackathon '26**

| Role | Responsibility |
|:-----|:---------------|
| 🧑‍💻 Frontend Developer | React UI, component architecture, responsive layouts |
| 🧑‍💻 Backend Developer | API design, database schema, Odoo integration |
| 🎨 UI/UX Designer | Design system, wireframes, user experience flows |
| 📊 Data Analyst | Budget logic, analytics dashboard, and cost modelling |

</div>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=130&section=footer&animation=fadeIn" width="100%" />

**⭐ If Traveloop impressed you — drop a star. It keeps our team going! ⭐**

<br/>

![Made with Love](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F-red?style=for-the-badge)
&nbsp;
![Hackathon](https://img.shields.io/badge/Odoo%20×%20KAHE-Hackathon%20'26-714B67?style=for-the-badge&logo=odoo)
&nbsp;
![React](https://img.shields.io/badge/Powered%20by-React%20+%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=20232A)

</div>
