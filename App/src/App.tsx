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
import Verify2FA from "./pages/Verify2FA";
import Friends from "./pages/Friends";
import Home from "./pages/Home";
import PrivateRoute from "./components/PrivateRoute";
import Chat from "./pages/Chat";

const App = () => {
  return (
    <>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/" element={React.createElement(Home)} />
          <Route path="/auth" element={React.createElement(Authentification)} />
          <Route path="/auth/register" element={React.createElement(Register)} />
          <Route path="/auth/verify2fa-42api" element={React.createElement(Verify2FA)} />
          <Route 
            path="/landing" 
            element={<PrivateRoute component={React.createElement(Landing)} />}
          />
          <Route 
            path="/profile/:username" 
            element={<PrivateRoute component={React.createElement(Profile)} />}
          />
          <Route 
            path="/settings" 
            element={<PrivateRoute component={React.createElement(Settings)} />}
          />
          <Route 
            path="/play" 
            element={<PrivateRoute component={React.createElement(Play)} />}
          />
          <Route 
            path="/pong" 
            element={<PrivateRoute component={React.createElement(Pong)} />}
          />
          <Route
            path="/leaderboard"
            element={<PrivateRoute component={React.createElement(Leaderboard)} />}
          />
          <Route 
            path="/chat" 
            element={<PrivateRoute component={React.createElement(Chat)} />}
          />
          <Route 
            path="/friends" 
            element={<PrivateRoute component={React.createElement(Friends)} />}
          />
        </Routes>
      </Router>
    </>
  );
};

export default App;
