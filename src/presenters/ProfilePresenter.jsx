import { useEffect } from 'react';
import { ProfileView } from '../views/ProfileView';

/** Format any date-like value to dd/mm/yyyy */
function formatDate(raw) {
  if (!raw) return '';
  const d = raw?.toDate ? raw.toDate() : new Date(raw);
  if (isNaN(d)) return String(raw);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Presenter: reads profile and actions from user store; maps to view props.
 */
function ProfilePresenter({ model }) {
  const profile = model.user.profile;
  const isEditingProfile = model.user.isEditingProfile;
  const setEditingProfile = model.user.setEditingProfile;
  const updateDisplayName = model.user.updateDisplayName;

  const userProfile = profile ?? {};
  const history = userProfile.history ?? [];

  const PREVIEW_LIMIT = 3;

  // Format dates and reverse to show newest first
  const formattedAndSortedHistory = [...history].map(m => ({
    ...m,
    date: formatDate(m.date)
  })).reverse();

  const previewHistory = formattedAndSortedHistory.slice(0, PREVIEW_LIMIT);
  const hasMoreHistory = formattedAndSortedHistory.length > PREVIEW_LIMIT;

  function handleViewRoute(address, name) {
    return address || name;
  }

  function handleVisitWebsite(url) {
    return url;
  }

  return (
    <ProfileView
      userProfile={userProfile}
      isEditing={isEditingProfile}
      onStartEdit={() => setEditingProfile(true)}
      onCancelEdit={() => setEditingProfile(false)}
      onNameChange={(newName) => {
        if (newName && newName !== userProfile.displayName) {
          updateDisplayName(newName);
        }
        setEditingProfile(false);
      }}
      history={formattedAndSortedHistory}
      previewHistory={previewHistory}
      hasMoreHistory={hasMoreHistory}
      onViewRoute={handleViewRoute}
      onVisitWebsite={handleVisitWebsite}
    />
  );
}

export default ProfilePresenter;
