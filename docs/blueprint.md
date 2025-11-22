# **App Name**: Avidity

## Core Features:

- Firebase Integration: Integrate Firebase Auth, Firestore, and Storage using the Firebase Web SDK.
- Authentication: Implement email/password and Google sign-in with secure user data storage in Firestore.
- PWA Shell: Create a Progressive Web App shell with offline caching capabilities.
- Bottom Navigation: Implement a responsive bottom navigation for mobile and left sidebar for larger screens, linking to Home, Events, Directory, Commons, and Profile.
- Data Model: Define Firestore data models and corresponding TypeScript types.
- AI-Powered Recommendations: Suggest relevant events and directory entries to the user. The AI will use location data, user profile information and time information as a tool for suggesting entries and events that are time and location sensitive and match the user's preferences. Location data can be pulled from IP location to avoid a requirement for excessive permission requests.
- Role-Based Access: Enforce security rules for user profiles with role-based access control.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey trust and community.
- Background color: Light gray (#F5F5F5), almost white to ensure readability.
- Accent color: Teal (#009688) to highlight interactive elements and calls to action.
- Body font: 'Inter', sans-serif, for a clean and modern user interface.
- Headline font: 'Space Grotesk', sans-serif, providing a techy, scientific feel for the title.
- Use flat, minimalist icons from a library like Material Icons or Font Awesome to represent navigation items and actions.
- Card-based layout with rounded corners and subtle shadows for event, directory, and commons listings.