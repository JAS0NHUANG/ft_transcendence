import React from "react";
import { Link } from "react-router-dom";
import AvatarBarStyled from "./styles/AvatarBar.styled";
import axios from "axios";

type AvatarMenuProps = {
  to: string;
  buttonName: string;
  onClick?: () => void; // Add optional onClick prop
};

type AvatarBarProps = {
  userName?: string;
};

const AvatarNavButton: React.FC<AvatarMenuProps> = ({
  to,
  buttonName,
  onClick,
}) => {
  return (
    <Link to={to}>
      <h1 onClick={onClick}>{buttonName}</h1>
    </Link>
  );
};

const AvatarBar: React.FC<AvatarBarProps> = ({ userName }) => {
  const handleLogout = async () => {
    console.log("Logout button clicked");

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/auth/logout`,
        {
          withCredentials: true,
        }
      );
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AvatarBarStyled>
      <AvatarNavButton to={`/profile/${userName}`} buttonName="./Profile" />
      <AvatarNavButton to="/settings" buttonName="./Settings" />
      <AvatarNavButton
        to="/auth"
        buttonName="./Logout"
        onClick={handleLogout}
      />
    </AvatarBarStyled>
  );
};

export default AvatarBar;
