# Fitness Studio Admin App Reference

## Project Goal
Build a standalone app integrating core features from Trainerize, Digigrowth, and GymMaster, modernized for 2025 with a focus on user-friendliness for members, trainers, and admins.

## Core Features
- **Member Management**: Unified profiles, access control, AI-driven retention.
- **Training**: Customizable plans, progress tracking, AI adjustments.
- **Scheduling**: Trainer availability, member bookings, group classes, recurring slots, session types, multi-gym support.
- **Billing**: Usage-based billing, secure payments.
- **Marketing**: Automated campaigns, analytics, AI insights.
- **Communication**: Threaded messaging, automated notifications.
- **Reporting**: Gym performance, attendance, trainer utilization.

## Modern Technologies
- AI/ML for personalization and analytics (planned expansion).
- Wearable integration for health data (planned).
- VR/AR for immersive experiences (planned).
- Blockchain for secure payments (planned).

## User Experience
- Intuitive, responsive design with personalized dashboards for admins, trainers, and members.

## Security and Privacy
- Encrypted passwords (bcrypt), session-based authentication (Passport.js), GDPR/CCPA compliance in progress.
- Planned: Transition to JWT for stateless authentication.

## Scalability
- Cloud-based backend with microservices using Node.js, Express, and MongoDB.

## Current State (February 18, 2025)
- **Files**: 
  - Frontend: `index.html`, `script.js`, `styles.css`
  - Backend: `backend/app.js`, `backend/models/User.js`, `backend/models/Member.js`, `backend/models/Gym.js`, `backend/models/TrainerAvailability.js`, `backend/models/Booking.js`, `backend/models/GroupClass.js`, `backend/models/Invoice.js`, `backend/models/WorkoutPlan.js`, `backend/models/Campaign.js`, `backend/routes/auth.js`, `backend/routes/members.js`, `backend/routes/scheduling.js`, `backend/routes/invoices.js`, `backend/routes/workout-plans.js`, `backend/routes/dashboard.js`, `backend/routes/campaigns.js`, `backend/config/database.js`, `backend/package.json`
- **Dependencies**: 
  - Frontend: Font Awesome 5.15.4 CDN
  - Backend: Express.js, Mongoose, Passport.js, bcryptjs, body-parser, cors, express-session
- **Login**: Session-based authentication with Passport.js and role support (admin, trainer, member).
- **Sections**:
  - **Dashboard**: Role-specific metrics (admins: active members, revenue, trainer utilization; trainers: assigned members, engagement, sessions; members: sessions, plans, streak).
  - **Members**: CRUD operations via `/api/members` for admins.
  - **Billing**: Full CRUD operations via `/api/invoices` for admins.
  - **Training**: 
    - Admins: Full CRUD operations for workout plans, assigning to members and trainers.
    - Trainers: Manage workout plans and view progress analytics for assigned members via "My Members".
    - Members: View assigned plans, log workouts, and see progress analytics in "My Plans".
  - **Scheduling**: 
    - Admins: View trainer availability and bookings.
    - Trainers: Manage availability and view bookings via "My Schedule".
    - Members: Book sessions via "Book Session".
  - **Marketing**: Campaign management with CRUD operations and analytics via `/api/campaigns` (admin only).
  - **Settings**: Placeholder with profile update form (endpoint pending).
  - **Trainer Dashboard**: My Members (plan CRUD and analytics), My Schedule (availability and bookings), metrics.
  - **Member Dashboard**: My Plans (view plans, log workouts, and analytics), Book Session (booking form and view), metrics.
- **Data**: MongoDB with Mongoose models (`User`, `Member`, `Gym`, `TrainerAvailability`, `Booking`, `GroupClass`, `Invoice`, `WorkoutPlan`, `Campaign`).

## Implemented Features
- **Backend**:
  - Secure user authentication with roles via `/api/auth/login` and `/api/auth/logout`.
  - Member management API (`/api/members` GET, POST, DELETE).
  - Scheduling API (`/api/scheduling/availability`, `/api/scheduling/bookings`, `/api/scheduling/group-classes` GET, POST).
  - Billing API (`/api/invoices` GET, POST, PUT, DELETE) for invoice management.
  - Workout Plans API (`/api/workout-plans` GET, POST, PUT, DELETE, POST /:id/log, GET /:id/analytics) with role-based access control, workout logging, and progress analytics.
  - Dashboard API (`/api/dashboard` GET) for role-specific metrics.
  - Marketing API (`/api/campaigns` GET, POST, PUT, DELETE, GET /:id/analytics) for campaign management and performance analytics (admin only).
  - MongoDB integration with models for users, members, gyms, scheduling, billing, workout plans, and campaigns.
- **Frontend**:
  - Role-based navigation and section visibility.
  - Login/logout with backend API integration.
  - Member management with API-driven CRUD for admins.
  - Billing section with full invoice CRUD operations for admins.
  - Training section with:
    - Admin: Full CRUD for workout plans, view of availability and bookings.
    - Trainer: My Members with plan CRUD and progress analytics (completion rate, frequency, engagement score).
    - Member: My Plans with plan viewing, workout logging, and progress analytics (completion rate, frequency, streak, tips).
  - Marketing section with campaign creation, editing, listing, deletion, and analytics display (reach, engagement, rate, tips).
  - Dashboard with role-specific metrics and actionable insights.

## To-Do List
- **Backend**:
  - Implement additional API endpoints:
    - `/api/users/me` (GET, PUT) for profile management.
    - Enhance `/api/scheduling` with DELETE endpoints and group class booking logic.
  - Transition to JWT authentication for production scalability.
  - Integrate calendar APIs (e.g., Google Calendar).
  - Write unit tests (e.g., Jest).
- **Frontend**:
  - Enhance training section:
    - Improve session management integration with scheduling.
  - Finalize settings with profile updates, theme selection, and additional options.
  - Improve responsive design in `styles.css`.
- **General**:
  - Add AI-driven features (e.g., retention predictions).
  - Explore VR/AR and blockchain implementations.

## Last Task Completed
- **Backend**: Enhanced `/api/campaigns` with `GET /:id/analytics` for campaign performance metrics (reach, engagement, rate, tip).
- **Frontend**: Implemented campaign editing with form pre-population and added analytics display in the Marketing section.

## Next Task
- **Backend**: Enhance `/api/scheduling` with DELETE endpoints for availability and bookings.
- **Frontend**: Improve Scheduling section with delete functionality for availability and bookings.

## Notes
- **Testing**: Use test users (e.g., `{ username: "admin", password: "pass123", role: "admin" }`) in MongoDB.
- **Setup**: Backend at `http://localhost:5000`, frontend at `http://localhost:8080`.
- **Future**: After scheduling enhancements, focus on settings and AI-driven features.