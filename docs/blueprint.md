# **App Name**: MukomaAI

## Core Features:

- User Authentication: Secure user sign-up/sign-in with email/password and Google OAuth using Firebase Authentication.
- Chat Interface: A mobile-first chat interface with streaming AI responses, user/assistant message bubbles, and language toggle (Shona default, English/Ndebele).
- Persona Selection: Allows users to select from a range of AI personas (Mukoma, Muzukuru, etc.) to influence the AI's responses.
- AI-Powered Chat: Backend endpoint using Firebase Cloud Functions to handle AI requests, incorporating selected persona and language for personalized responses; returns streaming text. A reasoning tool should be considered.
- Chat History Storage: Persists chat history per user using Firestore, including message role, text, language, and timestamp.
- User Profile & Settings: User profile page and settings page for theme (light/dark), language, and default persona preferences.
- Marketplace Placeholder: Separate page with a category list layout for a future digital marketplace (stub only).

## Style Guidelines:

- Primary color: Vibrant green (#39FF14) for energy and a connection to Zimbabwean heritage.
- Background color: Charcoal (#2E2E2E) for a modern, minimal base.
- Accent color: Teal (#14FFFF) for interactive elements and highlights.
- Body and headline font: 'Inter', a grotesque-style sans-serif, for a modern, neutral feel.
- Mobile-first, responsive design adapting to different screen sizes. Sidebar navigation for chat list.
- Minimal, modern icons for settings, profile, and marketplace navigation.
- Subtle animations for loading states, message delivery, and UI transitions.