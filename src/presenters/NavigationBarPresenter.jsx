import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationBarView } from '../views/NavigationBarView';
import LogoutButtonPresenter from './LogoutPresenter.jsx';

export default function NavigationBarPresenter({ model }) {
    const user = model.user.user;
    const navigate = useNavigate();

    // Leave room when the user clicks the logo to navigate home
    const handleLogoClick = useCallback(async (event) => {
        event.preventDefault();
        if (user?.uid && model.room.roomId) {
            await model.room.leaveRoomRemote(user.uid);
            model.room.leaveRoom();
            model.room.resetRoom();
        }
        navigate('/');
    }, [user?.uid, model.room, navigate]);

    return (
        <NavigationBarView
            logoutButton={<LogoutButtonPresenter model={model} />}
            onLogoClick={handleLogoClick}
        />
    );
}
