import { useNavigate } from 'react-router-dom';

export function LogoutWindowView({
  open,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  const navigate = useNavigate();



  function confirmLogoutACB() {
    onConfirm();
    navigate('/login');
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content logout-modal">

        <h2>Log out?</h2>

        <p>
          You can always log back into your SyncDine account later.
        </p>

        <div className="logout-actions">

          <button
            className="logout-cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="logout-confirm-btn"
            onClick={confirmLogoutACB}
          >
            Log out
          </button>

        </div>
      </div>
    </div>
  );
}