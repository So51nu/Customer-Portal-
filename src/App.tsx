import { useState } from 'react';
import LoginPage from "./components/loginPage";
import VibeConnectPortal from "./components/VibeConnectPortal";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      {isLoggedIn ? (
        <VibeConnectPortal onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <LoginPage onLogin={() => setIsLoggedIn(true)} />
      )}
    </>
  );
}

export default App;