import { LandingView } from '../views/LandingView';
import { useNavigate } from 'react-router-dom';

function LandingPresenter({ model }) {
  const navigate = useNavigate();

  function handleGetStartedACB() {
    navigate('/register');
  }

  function handleLoginACB() {
    navigate('/login');
  }

  return (
    <LandingView
      onGetStarted={handleGetStartedACB}
      onLogin={handleLoginACB}
    />
  );
}

export default LandingPresenter;
