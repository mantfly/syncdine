import { useEffect } from 'react';
import { GlobalToast } from '../views/components/GlobalToast';

/**
 * Presenter: bridges store error/success state into toast notifications.
 *
 * Watches error / successMsg state from every relevant store and converts
 * them into toast notifications, then clears the store field as a side-effect
 * so the same message is never shown twice.
 *
 * Rule: stores must NEVER call setToast() directly — they only set state
 * (error, successMsg). Presenters ARE allowed to call setToast() for
 * immediate UI feedback (e.g. SwipePresenter, RoomWaitingPresenter).
 * This presenter's unique responsibility is translating store-level state
 * changes into toasts so that stores remain UI-agnostic.
 */
export function AnnouncementPresenter({ model }) {
  const setToast     = model.user.setToast;

  // ── useRoomStore signals ────────────────────────────────────────────────
  const roomError      = model.room.error;
  const roomSuccess    = model.room.successMsg;
  const clearRoomError = model.room.clearRoomError;
  const clearSuccessMsg = model.room.clearSuccessMsg;

  // Translate roomStore errors → toast, then clear the store field
  useEffect(() => {
    if (!roomError) return;
    setToast(roomError, 'error');
    clearRoomError();
  }, [roomError]);

  // Translate roomStore success messages → toast, then clear
  useEffect(() => {
    if (!roomSuccess) return;
    setToast(roomSuccess, 'success');
    clearSuccessMsg();
  }, [roomSuccess]);

  // ── Render the shared Toast View ────────────────────────────────────────
  // GlobalToast reads toast state from useUserStore and renders the UI.
  // Presenters in the app that still call setToast() directly (e.g. for
  // geolocation errors, clipboard results, kick notifications) are also
  // correctly picked up here because they write to the same store field.
  return <GlobalToast model={model} />;
}
