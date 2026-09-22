import { useState } from 'react';


import { useUserStore } from '../model/useUserStore';
import { LogoutWindowView } from '../views/components/LogoutWindowView';
/**
 * Presenter: controls logout modal state and logout action.
 */
function LogoutButtonPresenter({ model }) {



  const logout = model.user.logout;


  const [open, setOpen] = useState(false);

  function logoutHandlerACB() {
    setOpen(true);
  }

  function cancelLogoutACB() {
    setOpen(false);
  }

  async function confirmLogoutACB() {
    await logout();

    setOpen(false);


  }

  return (
    <>
      <button
        type="button"
        onClick={logoutHandlerACB}
        className="nav-logout-btn nav-action-btn"
      >
        Logout
      </button>

      <LogoutWindowView
        open={open}
        onCancel={cancelLogoutACB}
        onConfirm={confirmLogoutACB}
      />
    </>
  );
}

export default LogoutButtonPresenter;