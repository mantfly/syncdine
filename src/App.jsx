import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import LobbyPresenter from './presenters/LobbyPresenter';
import CreateRoomPresenter from './presenters/CreateRoomPresenter';
import RoomWaitingPresenter from './presenters/RoomWaitingPresenter';
import MatchPresenter from './presenters/MatchPresenter';
import ProfilePresenter from './presenters/ProfilePresenter';
import LoginPresenter from './presenters/LoginPresenter';
import RegisterPresenter from './presenters/RegisterPresenter';

import { useAppStore } from './model/useAppStore';
import LandingPresenter from './presenters/LandingPresenter';
import NavigationBarPresenter from './presenters/NavigationBarPresenter';
import { AnnouncementPresenter } from './presenters/AnnouncementPresenter';

import { SuggestionPresenter } from './presenters/SuggestionPresenter';



import SwipePresenter from './presenters/SwipePresenter';
import HelpButtonPresenter from './presenters/HelpPresenter.jsx';
import { LoadingOverlayView } from './views/components/LoadingOverlayView';



// Protected Route wrapper component
const ProtectedRoute = ({ model, children }) => {
    const user = model.user.user;
    const isLoading = model.user.isLoading;
    const location = useLocation();

    if (isLoading) return null;

    if (!user) {
        // Preserve the intended destination so we can redirect back after auth
        return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
    }

    return children;
};

// Handles post-auth redirect: if user is already logged in,
// send them to the ?redirect= destination (or '/' by default).
const AuthRedirect = ({ user, children }) => {
    const [searchParams] = useSearchParams();
    if (user) {
        const redirectTo = searchParams.get('redirect') || '/';
        return <Navigate to={redirectTo} replace />;
    }
    return children;
};

export default function App() {
    const model = useAppStore();
    const user = model.user.user;
    const isLoading = model.user.isLoading;
    const initializeAuth = model.user.initializeAuth;


    useEffect(() => {
        const unsubscribe = initializeAuth();
        return unsubscribe;
    }, []);


    return (
        <div className="app-container">
            <AnnouncementPresenter model={model} />
            {isLoading && <LoadingOverlayView />}
            {user && (
                <nav className="nav-bar">
                    <NavigationBarPresenter model={model} />
                </nav>
            )}

            <Routes>

                {/* Public Routes – honour ?redirect= param after auth */}
                <Route path="/login" element={<AuthRedirect user={user}> <LoginPresenter model={model} /></AuthRedirect>} />
                <Route path="/register" element={<AuthRedirect user={user}><RegisterPresenter model={model} /></AuthRedirect>} />


                {/* Protected Routes */}
                <Route
                    path="/"
                    element={
                        user ? <LobbyPresenter model={model} /> : <LandingPresenter model={model} />
                    }
                />
                <Route
                    path="/create-room"
                    element={
                        <ProtectedRoute model={model}>
                            <CreateRoomPresenter model={model} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/room/:roomId"
                    element={
                        <ProtectedRoute model={model}>
                            <RoomWaitingPresenter model={model} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/match"
                    element={
                        <ProtectedRoute model={model}>
                            <MatchPresenter model={model} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/room/:roomId/swipe"
                    element={
                        <ProtectedRoute model={model}>
                            <SwipePresenter model={model} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/room/:roomId/no-match"
                    element={
                        <ProtectedRoute model={model}>
                            <SuggestionPresenter model={model} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute model={model}>
                            <ProfilePresenter model={model} />
                        </ProtectedRoute>
                    }
                />



            </Routes>
            <HelpButtonPresenter model={model} />
        </div>
    );
}
