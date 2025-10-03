# ⚕️ Arogya Nabha: Telemedicine for Punjab

[![GitHub last commit](https://img.shields.io/github/last-commit/NishitSK/arogya-nabha)]()
[![GitHub issues](https://img.shields.io/github/issues-raw/NishitSK/arogya-nabha)]()
[![GitHub closed issues](https://img.shields.io/github/issues-closed-raw/NishitSK/arogya-nabha)]()
[![Open Source Love](https://badges.frapsoft.com/os/v2/open-source.png?v=103)](https://github.com/NishitSK/arogya-nabha)

**Arogya Nabha** (Health Nabha) is a dedicated, open-source telemedicine platform focused on providing essential and localized healthcare access to the residents of **Nabha, Punjab**. It bridges the gap between rural communities and medical professionals through digital consultation and record management.

Project is live at [**Arogya Nabha**](https://arogyanabha.vercel.app/).

---

## ✨ Project Highlights

Arogya Nabha is designed to be highly functional and community-focused:

* **Multilingual Interface:** Includes full localization support for **English, Hindi, and Punjabi**, maximizing accessibility for local villagers.
* **Emergency Response:** Features a crucial **Emergency Services** section with local contacts and a **Volunteer Registration** module to build a community-based rapid response team.
* **Telehealth System:** Robust **Doctor** and **Patient Dashboards** manage scheduling, virtual consultations, digital prescriptions, and health records.
* **Local Locator:** Utilizes map integration to help users **Find Nearby Hospitals** in Nabha, with filters for government, private, and charitable facilities.

---

## 💻 Tech Stack

This project is built using a modern and scalable **MERN-adjacent** stack, leveraging the utility-first approach of Tailwind CSS:

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React (with Vite)** | Fast, component-based user interface development. |
| **Styling** | **Tailwind CSS** | Utility-first framework for rapid, custom design and responsive layouts. |
| **Backend** | **Express.js** | Handling API routes, business logic, and server-side operations. |
| **Database** | **MongoDB** | Flexible, document-based data storage. |
| **Language** | **JavaScript/Node.js** | Unified language across the entire stack. |

---

## ⚙️ How to Run the Project Locally

Follow these steps to set up the **Arogya Nabha** application for development or testing.

### 1. Prerequisites

You must have the following installed: **Node.js** (version 16 or higher recommended), **npm** or **yarn**, **Git**, and a running **MongoDB** instance.

### 2. Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/NishitSK/arogya-nabha.git](https://github.com/NishitSK/arogya-nabha.git)
    cd arogya-nabha
    ```

2.  **Configure Environment Variables:**
    Create a file named **`.env`** in the root directory and add your configuration details. At a minimum, this must include your MongoDB connection string and a secret key:

    ```bash
    # Example .env file content
    MONGO_URI="mongodb://localhost:27017/arogya-nabha-db" 
    PORT=5000
    JWT_SECRET="YOUR_SECURE_RANDOM_SECRET" 
    # Add any other API keys (e.g., for mapping/video) here
    ```

### 3. Install Dependencies and Run

The project has two main parts: the `backend` (Express) and the `frontend` (React/Vite/Tailwind).

#### A. Backend (Express.js)

1.  Navigate to the backend directory and install dependencies:
    ```bash
    cd backend
    npm install
    ```
2.  Start the Express server:
    ```bash
    npm run start 
    # or use 'npm run dev' if you have a nodemon script
    ```
    The server will typically run on `http://localhost:5000`.

#### B. Frontend (React/Vite/Tailwind)

1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend 
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the React development server:
    ```bash
    npm run dev
    ```
    The frontend will typically open at `http://localhost:5173`.

---

## 🤝 Contribution Guidelines

This is an open-source project aimed at public welfare, and any contribution—from code fixes to translations—is highly valued.

1.  **Fork** the repository.
2.  **Clone** your fork.
3.  Create a descriptive **new branch** for your feature or fix (e.g., `feature/Patient-Chat` or `fix/Login-Bug`).
4.  Commit your changes using clear messages (e.g., `feat: Implement secure video consultation via [API]`).
5.  Push your branch to your fork.
6.  Open a **Pull Request (PR)** to the main repository.

**Thank you for helping us bring better healthcare to Nabha!** 🙏
