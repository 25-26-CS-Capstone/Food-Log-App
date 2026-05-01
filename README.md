# 🍽️ Food Log App

The **Food Log App** is a simple and interactive nutrition tracking project that allows users to search for food items, view their ingredients, and detect potential allergens automatically using the **OpenFoodFacts API**.  
It aims to help users make healthier dietary choices and keep track of their daily meals in an organized way.

---

##  Features

Search for foods using the OpenFoodFacts API  
Display ingredients and basic details  
Automatically detect common allergens  
Modular structure (frontend and backend separated)  
Easy setup and clean, readable code  

---

## About the project

This project aims to promote healthier eating habits through data-driven insights and easy food tracking.
It is designed with expandability in mind, allowing future integration with fitness trackers or habit-tracking dashboards.
The backend efficiently handles API communication and data processing, while the frontend focuses on clean and interactive design.
Future versions will include user authentication, personalized diet suggestions, and AI-based meal recommendations.
Overall, the Food Log App serves as a step toward a smart nutrition and lifestyle management ecosystem.

---

## Getting Started
* Make sure Node.js is installed (node -v or node --version). Install from here: (https://nodejs.org/en/download)
* Make sure Git is installed (git --version or git version). Install from here: (https://git-scm.com/install/) 
1. Clone repo
2. Install Expo in project directory (npm install expo)
3. Install Expo Go (https://expo.dev/go)
4. Install dependencies (npm install)
5. Run on your target platform:
	 - iOS: `npm run ios`
	 - Android: `npm run android`
	 - Web browser: `npm run web`
6. For a multi-platform dev menu with QR code, use: `npm start`

---

## Authentication + Notifications

- User auth is handled by Supabase and session persistence is enabled across iOS, Android, and web.
- Register stores user profile data (name/email) and login uses that data for personalized experience.
- Login events persist user info such as last login and login-day count.
- Login notifications are sent on every successful login:
	- iOS/Android: local push notification via Expo Notifications.
	- Web: browser notification (or browser alert fallback when notifications are blocked/unavailable).
- For security, raw passwords are used only for authentication and are not stored locally in app data.
