# Deskly — Aesthetic Workspace & Study Spot Discovery Map

Deskly is a community-driven platform designed for discovering and sharing the best local study spots, cafes, and creative workspaces. Inspired by the clean, "brutalist" aesthetic of **Workspaces.xyz**, Deskly combines a high-end visual identity with real-time interactive mapping.

## 🚀 Live Demo
[View Live App](https://ais-pre-lxjqhm6uhzhhixw3gn3wum-486242309099.asia-southeast1.run.app)

## ✨ Features
- **Interactive Dark-Theme Map**: A premium, high-contrast map interface using Leaflet and CartoDB Dark Matter.
- **Real-Time Crowdsourcing**: Powered by Firebase Firestore for instant location pinning and updates across all users.
- **Aesthetic Brand Identity**: A bold lime green and black color palette with custom category-specific icons (Laptop, Coffee, Star, etc.).
- **Smart Filtering & Search**: Easily filter by category (Work, Coffee, Study, Hidden Gems, Food) or search for specific spots by name or tags.
- **Google Authentication**: Secure login for contributors to manage their pinned locations.
- **Responsive Design**: Optimized for both desktop exploration and mobile on-the-go discovery.

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS 4.
- **Animations**: Motion (formerly Framer Motion).
- **Mapping**: Leaflet.js with React-Leaflet.
- **Backend**: Firebase (Authentication, Firestore, Security Rules).
- **Icons**: Lucide React.

## 📦 Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd deskly
```

### 2. Install dependencies
```bash
npm install
```

### 3. Firebase Configuration
Create a `firebase-applet-config.json` in the root directory with your Firebase project credentials:
```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_AUTH_DOMAIN",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_STORAGE_BUCKET",
  "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
  "appId": "YOUR_APP_ID",
  "firestoreDatabaseId": "(default)"
}
```

### 4. Run Development Server
```bash
npm run dev
```

## 🛡️ Security Rules
The project includes a `firestore.rules` file. Make sure to deploy these to your Firebase Console to ensure data integrity and user privacy.

## 🎨 Design Inspiration
The visual identity is heavily inspired by **Workspaces.xyz**, focusing on simplicity, bold typography, and a "digital-first" productive feel.

---
*Built with ❤️ for the Replit Bounty community.*
