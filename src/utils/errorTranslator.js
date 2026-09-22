/**
 * Translates raw Firebase Auth error codes into friendly, user-facing messages.
 */
export function getAuthErrorMessage(err) {
  const code = err?.code ?? '';
  const messages = {
    // Login errors
    'auth/invalid-credential':      'Incorrect email or password. Please try again.',
    'auth/user-not-found':          'No account found with that email address.',
    'auth/wrong-password':          'Incorrect password. Please try again.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/user-disabled':           'This account has been disabled. Please contact support.',
    'auth/too-many-requests':       'Too many failed attempts. Please wait a moment and try again.',
    'auth/network-request-failed':  'Network error. Please check your connection and try again.',

    // Registration errors
    'auth/email-already-in-use':    'An account with this email already exists. Try logging in instead.',
    'auth/weak-password':           'Password is too weak. Please use at least 6 characters.',
    'auth/operation-not-allowed':   'Email/password sign-in is not enabled. Please contact support.',

    // Google sign-in errors
    'auth/popup-closed-by-user':    'Sign-in was cancelled. Please try again.',
    'auth/popup-blocked':           'Sign-in popup was blocked by your browser. Please allow popups and try again.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
    'auth/account-exists-with-different-credential':
      'An account already exists with this email using a different sign-in method.',
  };
  return messages[code] ?? 'Something went wrong. Please try again.';
}

/**
 * Translates room-related error reason codes into friendly, user-facing messages.
 */
export function getRoomErrorMessage(reason) {
  const messages = {
    'ROOM_NOT_FOUND':  'This room no longer exists or the link is invalid.',
    'ROOM_FULL':       'Sorry, this room is already full.',
    'INVALID_INPUT':   'The room code or link is invalid. Please try again.',
    'ALREADY_MEMBER':  'You are already in this room.',
  };
  return messages[reason] ?? 'Unable to join the room. Please try again.';
}
