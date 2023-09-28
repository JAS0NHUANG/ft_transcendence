import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Authentification from "./pages/Authentification";
import Register from "./pages/Register";
import Pong from "./pages/Pong";
import Landing from "./pages/Landing";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Play from "./pages/Play";
import GlobalStyle from "./theme/GlobalStyle";
import Hello from "./pages/Hello";
import Verify2FA from "./pages/Verify2FA";
import Friends from "./pages/Friends";

const App = () => {
  return (
    <>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/auth" element={React.createElement(Authentification)} />
          <Route path="/auth/register" element={React.createElement(Register)} />
          <Route path="/auth/verify2fa-42api" element={React.createElement(Verify2FA)} />
          <Route path="/" element={React.createElement(Landing)} />
          <Route
            path="/leaderboard"
            element={React.createElement(Leaderboard)}
          />
          <Route path="/settings" element={React.createElement(Settings)} />
          <Route path="/profile" element={React.createElement(Profile)} />
          <Route path="/chat" element={React.createElement(Friends)} />
          <Route path="/play" element={React.createElement(Play)} />
          <Route path="/pong" element={React.createElement(Pong)} />
          <Route path="/hello" element={React.createElement(Hello)} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
