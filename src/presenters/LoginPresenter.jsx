import { useEffect } from 'react';
import { LoginView } from '../views/LoginView';
import { getAuthErrorMessage } from '../utils/errorTranslator';

/**
 * Presenter: reads auth state from store, defines handlers that call store + navigate, renders LoginView.
 */
function LoginPresenter({ model }) {
  const isLoading = model.user.isLoading;
  const error = model.user.error;
  const loginWithEmail = model.user.loginWithEmail;
  const loginWithGoogle = model.user.loginWithGoogle;
  const clearError = model.user.clearError;

  // Clear any leftover error from a previous auth interaction
  useEffect(() => {
    clearError();
  }, []);

  function handleLoginACB(email, password) {
    loginWithEmail(email, password);
  }

  function handleGoogleLoginACB() {
    loginWithGoogle();
  }

  return (
    <LoginView
      isLoading={isLoading}
      error={error ? getAuthErrorMessage(error) : null}
      onLogin={handleLoginACB}
      onGoogleLogin={handleGoogleLoginACB}
    />
  );
}

export default LoginPresenter;
