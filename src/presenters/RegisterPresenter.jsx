import { useEffect } from 'react';
import { RegisterView } from '../views/RegisterView';
import { getAuthErrorMessage } from '../utils/errorTranslator';
/**
 * Presenter: reads auth state from store, defines handlers that call store + navigate, renders RegisterView.
 */
function RegisterPresenter({ model }) {

  const isLoading = model.user.isLoading;
  const error = model.user.error;
  const registerWithEmail = model.user.registerWithEmail;
  const loginWithGoogle = model.user.loginWithGoogle;
  const clearError = model.user.clearError;

  // Clear any leftover error from a previous auth interaction
  useEffect(() => {
    clearError();
  }, []);

  function handleRegisterACB(name, email, password, avatarUrl) {
    registerWithEmail(name, email, password, avatarUrl);
  }

  function handleGoogleLoginACB() {
    loginWithGoogle();
  }

  return (
    <RegisterView
      isLoading={isLoading}
      error={error ? getAuthErrorMessage(error) : null}
      onRegister={handleRegisterACB}
      onGoogleLogin={handleGoogleLoginACB}
    />
  );
}

export default RegisterPresenter;
