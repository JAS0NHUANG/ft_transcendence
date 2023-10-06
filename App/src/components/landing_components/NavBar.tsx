import React from "react";
import { Link } from "react-router-dom";
import NavBarStyled from "./styles/NavBar.styled";
import axios from "axios";

type NavButtonProps = {
  to: string;
  iconSrc: string;
  alt: string;
  onClick?: () => void; // Add optional onClick prop
};

const NavButton: React.FC<NavButtonProps> = ({ to, iconSrc, alt, onClick }) => {
  return (
    <Link to={to}>
      <img src={iconSrc} alt={alt} onClick={onClick}/>
    </Link>
  );
};

const NavBar: React.FC = () => {

  const handleLogout = async () => {
    console.log("Logout button clicked");

    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
        withCredentials: true,
      });
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <NavBarStyled>
      <NavButton to="/landing" iconSrc="/src/assets/icon/Home.svg" alt="Home" />
      <NavButton to="/play" iconSrc="/src/assets/icon/Play.svg" alt="Play" />
      <NavButton
        to="/leaderboard"
        iconSrc="/src/assets/icon/Leaderboard.svg"
        alt="Leaderboard"
      />
      <NavButton
        to="/chat"
        iconSrc="/src/assets/icon/Chat.svg"
        alt="Chat"
      />
      <NavButton
        to="/friends"
        iconSrc="/src/assets/icon/Friends.svg"
        alt="Friends"
      />
      <NavButton to="/" iconSrc="/src/assets/icon/Exit.svg" alt="Exit" onClick={handleLogout} />
    </NavBarStyled>
  );
};

export default NavBar;
