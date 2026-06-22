# HealthCare Management SaaS Portal

A modern, hospital-grade, SaaS-style Healthcare Management System designed for final-year project demonstrations and portfolio showcases. 

It connects **Patients**, **Medical Doctors**, and **Administrators** through clean role-based dashboards, featuring real-time booking slot checks, prescription builders, clinical history records, and administrative metric trackers.

---

## 🌟 Tech Stack & Features

*   **Frontend**: React.js (Vite), React Router DOM (Client Routing), Context API (Auth Sessions), Inter & Outfit Google Fonts.
*   **Backend**: Node.js & Express.js, JWT (Authentication & Security), Bcryptjs (Password Hashing), CORS (Cross-Origin Resource Sharing).
*   **Database**: MongoDB Atlas Cluster (Mongoose Object Modeling).
*   **Port Allocations**:
    *   **Frontend Client**: Runs on `http://localhost:5174/`
    *   **Backend Server API**: Runs on `http://localhost:5001/` (switched from port `5000` to avoid Apple AirPlay Receiver conflicts on macOS Monterey+).

---

## 🔑 Default Administrator Login (Seeded)

To demonstrate dashboard metrics, physician verification, and master logs right away, use the pre-configured admin account:
*   **Email**: `admin@healthcare.com`
*   **Password**: `adminpassword123`

---

## 🚀 How to Run the Project Locally

### 1. Run the Backend API
1. Open your terminal in the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server (runs nodemon):
   ```bash
   npm run dev
   ```

### 2. Run the Frontend Client
1. Open a new terminal in the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Click or open **`http://localhost:5174/`** in your browser.
