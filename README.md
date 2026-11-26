# EstateEase — Luxury Real Estate Management Platform

A complete, modern, dynamic, and professional Real Estate Management Full-Stack Web Application built for North India's premier property markets (Gurugram, Delhi, Noida, Faridabad).

---
.
## 🌟 Technology Stack

- **Frontend**:
  - React 19 + Vite
  - React Router DOM v7
  - Lucide React Icons
  - Custom Luxury Design System (Dark Forest Green `#173D32`, Beige/Gold `#C9B58B`, Cream `#FAF9F6`, White `#FFFFFF`)
  - Google Fonts: *Playfair Display* (Serif Headings) & *Plus Jakarta Sans* (Body)

- **Backend**:
  - Node.js & Express.js
  - RESTful API Architecture
  - bcryptjs Password Hashing
  - CORS, dotenv

- **Database**:
  - MySQL Database (`realestate`)
  - `mysql2` driver
  - 8 core relational tables: `users`, `agents`, `clients`, `properties`, `appointments`, `transactions`, `payments`, `property_images`, plus `contact_messages`.

---

## 🏛️ Project Structure

```
real estate/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection pool configuration
│   ├── .env                     # Database credentials & port configuration
│   ├── package.json             # Backend dependencies (express, mysql2, bcryptjs, cors, dotenv)
│   ├── setup_database.js        # Safe schema verifier, address/description enhancer, and image seeder
│   └── server.js                # Complete REST APIs (Auth, Properties, Appointments, Transactions, Dashboards)
│
├── frontend/
│   ├── public/                  # Favicons and SVG assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Luxury navigation bar with auth badges & mobile drawer
│   │   │   ├── Navbar.css
│   │   │   ├── Footer.jsx       # Brand narrative, quick links, prime corridors, newsletter
│   │   │   ├── Footer.css
│   │   │   ├── PropertyCard.jsx # Reusable property card with INR pricing, badges, specs
│   │   │   ├── PropertyCard.css
│   │   │   └── AppointmentModal.jsx # Private viewing appointment booking modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication state & role-based session management
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Hero with multi-factor search, featured properties, locations, testimonials
│   │   │   ├── Home.css
│   │   │   ├── Properties.jsx   # Catalog with filter bar (type, location, price, beds), sorting, search
│   │   │   ├── Properties.css
│   │   │   ├── Locations.jsx    # Overview cards for Gurugram, Delhi, Noida, Faridabad
│   │   │   ├── Locations.css
│   │   │   ├── LocationDetail.jsx # Location-specific property showcase (/locations/:cityName)
│   │   │   ├── PropertyDetails.jsx # Image gallery, address, specifications, agent card, booking
│   │   │   ├── PropertyDetails.css
│   │   │   ├── Login.jsx        # Login with email/pass, show/hide toggle, demo accounts
│   │   │   ├── Register.jsx     # Registration with bcrypt hashing & role selection (Admin/Agent)
│   │   │   ├── Auth.css
│   │   │   ├── About.jsx        # Story, mission, vision, advantage pillars, team showcase
│   │   │   ├── About.css
│   │   │   ├── Contact.jsx      # Contact form connected to MySQL, HQ details, FAQ accordion
│   │   │   ├── Contact.css
│   │   │   ├── AdminDashboard.jsx # Overview KPIs, Properties CRUD, Users, Appointments, Transactions
│   │   │   ├── AgentDashboard.jsx # Assigned properties, private appointments, clients, deals
│   │   │   └── Dashboard.css
│   │   ├── services/
│   │   │   └── api.js           # Centralized API fetch client
│   │   ├── App.jsx              # React Router setup & ProtectedRoute guards
│   │   ├── index.css            # Luxury Design System variables, resets, badges, buttons
│   │   └── main.jsx
│   ├── index.html               # Luxury typography import and metadata
│   └── package.json
└── README.md
```

---

## 🔑 Demo Login Credentials

The application comes pre-configured with active accounts matching the database records:

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | Harshita | `harshita@estateease.com` | `temp_password_1` |
| **Agent** | Nishtha | `nishtha@estateease.com` | `temp_password_2` |
| **Agent** | Muskan | `muskan@estateease.com` | `temp_password_3` |
| **Agent** | Kirtika | `kirtika@estateease.com` | `temp_password_4` |
| **Agent** | Vaishali | `vaishali@estateease.com` | `temp_password_5` |

*(Tip: On the Login page, you can also click the 1-click **Quick Demo Login** buttons to immediately test as Admin or Agent!)*

---

## 🚀 How to Run the Application

### 1. Start the Backend Server:
```bash
cd "C:\Users\harsh\real estate\backend"
node server.js
```
The backend starts on `http://localhost:5000` and connects directly to MySQL.

### 2. Start the Frontend Server:
```bash
cd "C:\Users\harsh\real estate\frontend"
npm run dev
```
The frontend starts on `http://localhost:5173`. Open this URL in any browser.

---

## ✨ Features Implemented

1. **Home Page**:
   - Hero section with high-resolution architectural background.
   - 4-way property search bar (Location, Property Type, Purpose, Keyword).
   - Dynamic Featured Properties loaded from MySQL.
   - Popular Location showcase cards (Gurugram, Delhi, Noida, Faridabad).
   - Recently Added Properties section.
   - Why EstateEase luxury value pillars.
   - Authentic customer testimonials.

2. **Properties Catalog (`/properties`)**:
   - Live database listings with formatted Indian Rupee pricing (`₹85,00,000`).
   - Filter bar: Location, Property Type (Villa, Apartment, House, Plot, Commercial), Listing Type (Buy/Rent), Bedrooms (1+, 2+, 3+, 4+), Max Price.
   - Real-time search query by title, location, or keyword.
   - Sorting by Price (Low to High, High to Low) and Date (Newest, Oldest).
   - Active filter tags and one-click filter reset.

3. **Locations Showcase & Detail (`/locations` & `/locations/:cityName`)**:
   - Detailed guides and appreciation analytics for Gurugram, Delhi, Noida, and Faridabad.
   - Each card opens a dedicated regional page listing properties in that city.

4. **Property Details Page (`/properties/:id`)**:
   - Interactive high-resolution photo gallery with thumbnail selector.
   - Title, Price, Full Physical Address, and Status badges.
   - Specifications grid (Bedrooms, Bathrooms, Carpet Area).
   - Full description & architectural overview.
   - Luxury features checklist (24/7 Security, Elevator, Parking, Pool, etc.).
   - Assigned Agent profile card with direct phone, email, and experience.
   - **Interactive "Book Private Viewing" modal** that creates real appointment records in MySQL.
   - Similar properties recommendation carousel.

5. **Authentication & Roles**:
   - Login page with show/hide password toggle and session persistence.
   - Registration page with password confirmation and role selection (Agent/Admin).
   - Passwords hashed securely using `bcryptjs`.
   - Role-guarded dashboard routing (`/dashboard/admin` and `/dashboard/agent`).

6. **Admin Dashboard (`/dashboard/admin`)**:
   - Live aggregate KPIs (Total Properties, Clients, Agents, Transactions, Volume).
   - **Manage Properties**: Add new property modal, Edit property modal, and Delete property.
   - **Manage Users & Agents**: View directory of registered advisors, roles, and manage users.
   - **Manage Appointments**: View all viewings, client phone/email, and update status dropdown (Scheduled, Completed, Cancelled).
   - **Manage Transactions & Payments**: View ledger, record new transactions, update deal status, view payment methods.
   - **Client Inquiries**: Review submissions from the contact form.

7. **Agent Dashboard (`/dashboard/agent`)**:
   - Personalized for the logged-in agent.
   - Key stats: Assigned properties count, scheduled appointments, direct clients, deal volume.
   - **Assigned Properties**: View only properties assigned to this agent, with instant status updater (Available, Sold, Rented) and "Add Property" under own portfolio.
   - **My Appointments**: Schedule of upcoming client viewings with one-click status changes.
   - **My Clients**: Directory of clients who booked appointments or transactions with this agent.
   - **My Transactions**: History of transactions closed under this agent's mandate.

8. **Contact Page (`/contact`)**:
   - Functional contact form submitting directly to MySQL `contact_messages`.
   - Headquarters details, direct hotline, concierge email, and office hours.
   - Interactive FAQ accordion addressing client questions.

9. **About Us Page (`/about`)**:
   - Brand history, mission & vision statements, advantage pillars, and leadership team showcase.
