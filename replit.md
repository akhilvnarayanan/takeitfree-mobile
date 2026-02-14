# TakeItFree - Community Sharing Platform

## Overview
TakeItFree is a community-driven mobile app where people give away items they no longer need for free. It combines a social media feed experience with local community sharing, focusing on generosity and human connections rather than transactions.

## Tech Stack
- **Frontend**: Expo React Native with Expo Router (file-based routing)
- **Backend**: Express.js (serves landing page and API)
- **State Management**: React Context + AsyncStorage for local persistence
- **UI**: Custom components with Nunito font family
- **Theme**: Warm coral (#E8725A) primary, teal (#1B8A7A) secondary

## Architecture
- `app/(tabs)/` - Tab screens: Home feed, Discover, Activity, Profile
- `app/create.tsx` - Share item modal
- `app/item/[id].tsx` - Item detail screen
- `components/` - Reusable UI components (ItemCard, CategoryPill, RequestSheet)
- `contexts/AppContext.tsx` - Main app state with AsyncStorage persistence
- `constants/colors.ts` - Theme colors
- `server/` - Express backend

## Key Features
- Social feed showing shared items with stories
- Category-based browsing and search
- Request system for items (request, approve, decline)
- Appreciation system (like hearts)
- Comments on items
- User profiles with sharing stats
- Seed data for demo experience

## Categories
Books, Clothes, Electronics, Furniture, Toys, Kitchen, Sports, Other

## Recent Changes
- Initial build: Full app with feed, discover, activity, profile, create, and detail screens
