import { useState, useEffect } from "react";
import axios from "axios";
import AvatarButton from "../components/landing_components/AvatarButton";
import LandingButton from "../components/landing_components/LandingButton";
import NavBar from "../components/landing_components/NavBar";
import AvatarBar from "../components/landing_components/AvatarBar";
import LandingContainer from "../components/landing_components/styles/LandingContainer.styled";

const Landing: React.FC = () => {
  const [menuBarIsShown, setMenuBarIsShown] = useState(false);
  const [avatarBarIsShown, setAvatarBarIsShown] = useState(false);
  const [avatarPath, setAvatarPath] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/me`,
          {
            withCredentials: true,
          }
        );
        setAvatarPath(response.data.avatar);
        setUserName(response.data.userName);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserData();
  }, []);

  const handleLandingClick = () => {
    setMenuBarIsShown((current) => !current);
    if (avatarBarIsShown) setAvatarBarIsShown((current) => !current);
  };

  const handleAvatarClick = () => {
    setAvatarBarIsShown((current) => !current);
    if (menuBarIsShown) setMenuBarIsShown((current) => !current);
  };

  const userImageSrc = `data:image/png;base64,${avatarPath}`;

  return (
    <>
      <LandingContainer>
        <LandingButton onClick={handleLandingClick} navBar={menuBarIsShown} />
        <AvatarButton
          userImageSrc={userImageSrc}
          onClick={handleAvatarClick}
          avaBar={avatarBarIsShown}
        />
      </LandingContainer>
      {menuBarIsShown && <NavBar />}
      {avatarBarIsShown && <AvatarBar userName={userName} />}
    </>
  );
};

export default Landing;
