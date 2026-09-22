# SyncDine

https://syncdine-3b4f5.firebaseapp.com

SyncDine is a collaborative restaurant selection web app where groups create rooms, swipe on restaurants together (Tinder-style), and get matched to a restaurant when all members vote for the same one. Built with React, Vite, Zustand, and Firebase.


## What Has Been Done

- User authentication (email/password and Google OAuth)
- User Profile (Preferences, Matching history)
- Room creation with configurable restaurant filters (cuisine, price level, distance, minimum rating)
- Real-time lobby/waiting room with member readiness tracking via Firebase snapshots
- Tinder-style swipe card interface for voting on restaurants with an external library
- Matching algorithm that detects when all room members have voted for the same restaurant
- Google Places API integration for fetching nearby restaurants based on room configuration
- Address input autocomplete
- DiceBear avatar generation for user profiles
- Firebase Firestore real-time sync across all room members
- Rate limiting for external API calls
- Landing page
- Friendly UI/UX with clear functionality
- Help button that the user can click at all times to get more information on the application
- Suggestions page when all results are swiped and there is no match


# SyncDine Architecture Overview:

This project is built using a strict Model-View-Presenter (MVP) architectural pattern, same as the ones in the labs. It uses zustand for state management and firebase for data persistence. If you are not familiar, Zustand implements the "reactive model" by using subscriptions. The presenter subscribes to the model or a variable in the model, and when this model changes the value in presenter also changes automatically.

It consists of 5 main layers:

1. Model (/model): The Model layer houses the Application State and Business Logic. It is built using Zustand (useUserStore, useRoomStore, useSwipeStore, PlaceStore). Each folder handles a different side of the app state
-- useUserStore: Handles user authentication and profile data.
-- useRoomStore: Handles room creation, joining, and management.
-- useSwipeStore: Handles the swiping logic and match results.

2. View layer (/view): Contains only the UI components with no logic. It recieves data as props from presenters and passes events up to them. 

3. Presenter layer (/presenter): Connects the model and view. It subscribes to the model for data and passes it to the view as props. It also handles events from the view and passes them to the model.

4. Persistence layer (firebaseModel.js): same concept as the labs persistence. It contains functions that communicate with firebase database, and passes these functions to the model.

5. External API layer (/api): Contains functions that communicate with external APIs, such as the places API. These functions are called by the model and passed to the view as props.

## Data flow example for swiping:
1. User Action: The user clicks a "Swipe Yes" button in SwipeView.jsx.
2. View to Presenter: SwipeView.jsx calls its injected onSwipeYes prop.
3. Presenter to Model: SwipePresenter.jsx receives the call and invokes submitVote() on the useSwipeStore.js model.
4. Model Business Logic: The store updates its local state (advancing the card index).
5. Model to Persistence: The store calls addVoteToRoom() from firebaseModel.js to persist the action to the cloud.
6. Reactive Update: Because the Model's state was updated, Zustand automatically triggers SwipePresenter.jsx to re-render, passing the new state down to SwipeView.jsx to show the next restaurant.

## APIs used:
The main API used was Google's (new) PlacesAPI. It offers multiple endpoints for different functionalities. The application uses the following endpoints:
1. "places:searchNearby": Fetches nearby restaurants according to given filters (the filters include distance and cuisines among other things, and are specified by user)
2. "places:autocomplete": Autocomplete the address that the user inputs
3. "places/placeId": Get the longitude and latitude coordinates of an address

## External APIs and libraries:
1. "react-tinder-card" Library for the tinder-like card swiping animations: https://www.npmjs.com/package/react-tinder-card . The library is used in the `SwipeView.jsx` file
2. dicebear API to get avatars as profile pics: https://www.dicebear.com

## File Structure

### `src/` — Application Source

| File | Description |
|------|-------------|
| `index.jsx` | App entry point; renders App into DOM with BrowserRouter |
| `App.jsx` | Main router; defines all routes and ProtectedRoute wrapper |
| `index.css` | Global styles and CSS utilities |
| `firebaseConfig.js` | Firebase SDK configuration |
| `firebaseModel.js` | Persistence layer; wraps all Firebase Auth and Firestore operations |
| `rateLimiter.js` | API rate limiting utility using localStorage |

### `src/model/` — Model: Zustand Stores (Business Logic and State)

| File | Description |
|------|-------------|
| `useUserStore.js` | Firebase Auth (email/password, Google OAuth) and user profile management |
| `useRoomStore.js` | Room lifecycle (LOBBY → SWIPING → MATCHED), member management, vote tracking |
| `useSwipeStore.js` | Swipe animation state (card index, direction) and match detection logic |
| `useAppStore.js` | Root Zustand store; composes user/room/swipe slices under namespaced `set`/`get` so each store remains modular |


### `src/api/` — External API Integrations

| File | Description |
|------|-------------|
| `PlacesApi.js` | Google Places API client; `fetchRestaurantsNearby()` and `getCurrentLocation()` |
| `avatarApi.js` | DiceBear avatar generation; `generateSeed()` and `getAvatarUrl()` |

### `src/img/` — Static Image Assets

| File | Description |
|------|-------------|
| `bg.png` | Background image used across the app |
| `landingbg.png` | Background image specific to the landing page |
| `hero.png` | Hero illustration shown on the landing page |
| `logo.svg` | SyncDine logo used in the navigation bar and landing page |
| `leave.svg` | "Leave room" icon used on action buttons |
| `refresh.svg` | Refresh icon used to reload restaurants or state |

### `src/presenters/` — Presenter Layer (Wiring Model to View)

| File | Description |
|------|-------------|
| `useRoomPresenter.js` | Shared hook for common room actions used across multiple presenters |
| `LoginPresenter.jsx` | Handles email/password and Google OAuth login logic |
| `RegisterPresenter.jsx` | Handles user registration and profile creation |
| `LogoutPresenter.jsx` | Logout action; clears auth state |
| `LobbyPresenter.jsx` | Lists user's rooms and handles room joining/creation |
| `CreateRoomPresenter.jsx` | Handles room creation with filter preferences |
| `RoomWaitingPresenter.jsx` | Manages waiting room, member readiness, navigates to swipe when ready |
| `SwipePresenter.jsx` | Handles swipe card logic and vote submission |
| `MatchPresenter.jsx` | Displays matched restaurant details after voting completes |
| `ProfilePresenter.jsx` | Handles user profile viewing and editing |
| `LandingPresenter.jsx` | Handles navigation logic for the landing screen and renders `LandingView` |
| `AnnouncementPresenter.jsx` | Watches store-level `error`/`successMsg` state and translates it into global toast notifications, keeping stores UI-agnostic |
| `HelpPresenter.jsx` | Thin wrapper that mounts the floating `HelpButtonPopUp` help/FAQ widget |
| `SuggestionPresenter.jsx` | Subscribes to the room and cross-references votes with restaurants to build a sorted list of partial matches for `SuggestionView` |
| `NavigationBarPresenter.jsx` | Wraps and Handles some edge cases with the `NavigationBarView.js`|

### `src/views/` — Top-Level Views (route-level UI)

| File | Description |
|------|-------------|
| `LoginView.jsx` | Login form UI (email/password and Google OAuth) |
| `RegisterView.jsx` | Registration form UI |
| `NavigationBarView.jsx` | Reusable navigation header with avatar and username |
| `LobbyView.jsx` | Room list and action buttons (create/join room) |
| `CreateRoomView.jsx` | Room creation form with cuisine, price, distance, rating selectors |
| `RoomWaitingView.jsx` | Waiting room UI with member readiness indicators and share code |
| `SwipeView.jsx` | Tinder-style swipe cards with yes/no buttons |
| `SwipeWaitingView.jsx` | "You're all done" waiting screen with per-member progress bar shown after a user finishes swiping but others have not |
| `MatchView.jsx` | Matched restaurant details (name, rating, address, image) |
| `SuggestionView.jsx` | "No perfect match" page listing restaurants by vote count with View Route / Visit Website actions |
| `ProfileView.jsx` | User profile display (avatar, username, history, dietary preferences) |
| `LandingView.jsx` | Landing page UI featuring hero section, feature cards, and navigation actions |

### `src/views/components/` — Reusable Components and Modals

| File | Description |
|------|-------------|
| `RestaurantCard.jsx` | Reusable restaurant card component |
| `GlobalToast.jsx` | Renders auto-dismissing global notifications for errors, success, and info messages |
| `HistoryModal.jsx` | Presentational modal for viewing match history with background scroll locking |
| `EditPreferencesModal.jsx` | Modal for editing a room's filters (room name, distance, cuisines, price level, minimum rating) |
| `HelpPopUp.jsx` | Floating "?" help button with an expandable popup containing onboarding info, feature list, and FAQ |
| `LogoutWindowView.jsx` | Logout confirmation modal with cancel/confirm actions; navigates to `/login` on confirm |
| `SwipeMembersPanel.jsx` | Side panel during swiping showing each member's avatar, name, and swipe status; admin-only kick button |


### `src/utils/` — Utility functions
| File | Description |
|------|-------------|
| `errorTranslator.js` | Translates raw Firebase Auth error codes into friendly, user-facing messages |
| `PlaceStore.js` | Helper funtions that process restaurants that are fetched from the PlacesAPI. Used in `useRoomStore.js` |
| `clipboardUtils.js` | Wraps `navigator.clipboard.writeText` and returns `{ ok, error }` so callers never need try/catch |
| `fixedConsts.js` | Shared constant lists (e.g. `MAIN_CUISINES`, `EXTRA_CUISINES`) used across room creation and preferences UI |


