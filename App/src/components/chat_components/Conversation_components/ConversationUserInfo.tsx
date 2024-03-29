import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { UserDetails, SocialActions, ActionButtons, UserStatus, CustomLink } from "./styles/ConversationUserInfo.styled";
import { Room } from "../../../pages/Chat";
import banIcon from "../../../assets/icon/BanUser.png";
import kickIcon from "../../../assets/icon/KickUser.png";
import muteIcon from "../../../assets/icon/MuteUser.png";
import adminIcon from "../../../assets/icon/AdminUser.png";
import { GameSocket } from "../../GameSocket";

export interface UserInfoProps {
  user: {
    userName: string;
    isBanned: boolean;
    isMuted: boolean;
    isBlocked: boolean;
    role: string;
  };
  chatRoom: Room;
}

function toTitleCase(input: string) {
  return `${input
    .toLowerCase()
    .split(" ")
    .join(" ")}`;
}

const UserInfo: React.FC<UserInfoProps> = ({ user, chatRoom }) => {
  const [loggedUsername, setLoggedUsername] = useState("");
  const [avatarPath, setAvatarPath] = useState("");
  const [status, setStatus] = useState("");
  const [isBanActive, setIsBanActive] = useState(user.isBanned);
  const [isMuteActive, setIsMuteActive] = useState(user.isMuted);
  const [isAdminActive, setIsAdminActive] = useState(user.role === "ADMIN");
  const EditedUserStatus = toTitleCase(status);
  console.log(user);

  const toggleButtonActiveState = (buttonStateFunction: React.Dispatch<React.SetStateAction<boolean>>) => {
    buttonStateFunction((prevState) => !prevState);
  };

  const handleUpdateError = (error: AxiosError) => {
    console.log(error.response?.data)
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/me`,
          {
            withCredentials: true,
          }
        );
        setLoggedUsername(response.data.userName);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user.userName) { // Check if versUsername is defined
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/user/userByUsername?userName=${user.userName}`,
            {
              withCredentials: true,
            }
          );
          setAvatarPath(response.data.avatar);
          setStatus(response.data.status);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchUserData();
  }, [user]);

  const banUser = async () => {
    const updateDTO = {
      username: user.userName,
      channel: chatRoom.name,
    };
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/channel/ban`,
        updateDTO,
        { withCredentials: true }
      );
      return response;
    } catch (error) {
      handleUpdateError(error as AxiosError);
    }
  };

  const unBanUser = async () => {
    const updateDTO = {
      username: user.userName,
      channel: chatRoom.name,
    };
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/channel/unban`,
        updateDTO,
        { withCredentials: true }
      );
      return response;
    } catch (error) {
      handleUpdateError(error as AxiosError);
    }
  };

  const handleBanClick = async () => {
    if (user.isBanned) {
      try {
        const response = await unBanUser();
        console.log(response?.data);
        toggleButtonActiveState(setIsBanActive);
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const response = await banUser();
        console.log(response?.data);
        toggleButtonActiveState(setIsBanActive);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const KickUser = async () => {
    const updateDTO = {
      username: user.userName,
      channel: chatRoom.name,
    };
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/channel/kick`,
        updateDTO,
        { withCredentials: true }
      );
      return response;
    } catch (error) {
      handleUpdateError(error as AxiosError);
    }
  };

  const handleKickClick = async () => {
    try {
      const response = await KickUser();
      console.log(response?.data);
    } catch (error) {
      handleUpdateError(error as AxiosError);
    }
  };

  const MuteUser = async () => {
    const updateDTO = {
      username: user.userName,
      channel: chatRoom.name,
    };
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/channel/mute`,
        updateDTO,
        { withCredentials: true }
      );
      return response;
    } catch (error) {
      handleUpdateError(error as AxiosError);
    }
  };

  const handleMuteClick = async () => {
    try {
      const response = await MuteUser();
      console.log(response?.data);
      toggleButtonActiveState(setIsMuteActive);
    } catch (error) {
      handleUpdateError(error as AxiosError);
    }
  };

  const setAdminUser = async () => {
    const updateDTO = {
      username: user.userName,
      channel: chatRoom.name,
    };
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/channel/addAdmin`,
        updateDTO,
        { withCredentials: true }
      );
      toggleButtonActiveState(setIsAdminActive);
      return response;
    } catch (error) {
      handleUpdateError(error as AxiosError);
    }
  };

  const unsetAdminUser = async () => {
    const updateDTO = {
      username: user.userName,
      channel: chatRoom.name,
    };
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/channel/removeAdmin`,
        updateDTO,
        { withCredentials: true }
      );
      toggleButtonActiveState(setIsAdminActive);
      return response;
    } catch (error) {
      handleUpdateError(error as AxiosError);
    }
  };

  const handleAdminClick = async () => {
    if (user.role !== "ADMIN") {
      try {
        const response = await setAdminUser();
        console.log(response?.data);
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const response = await unsetAdminUser();
        console.log(response?.data);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleChallenge = async () => {
    console.log("challenge me!!!", user.userName);
    GameSocket.emit("inviteUserToPlay", user.userName);
  }

  if (loggedUsername === user.userName) {
    return null;
  }

  return (
    <UserDetails>
      <CustomLink to={`/profile/${user.userName}`}>
        <img
          src={`data:image/png;base64,${avatarPath}`}
          alt={`Avatar of ${user.userName}`}
        />
      </CustomLink>
      <p>{user.userName}</p>
      {chatRoom.role !== "USER" && (
        <SocialActions>
          {user.role !== "OWNER" && (
            <ActionButtons
              $isactive={isBanActive}
              src={banIcon}
              alt="Ban"
              onClick={handleBanClick}
            />
          )}
          {user.role !== "OWNER" && (
            <ActionButtons
              src={kickIcon}
              alt="Kick"
              onClick={handleKickClick}
            />
          )}
          {user.role !== "OWNER" && (
            <ActionButtons
              $isactive={isMuteActive}
              src={muteIcon}
              alt="Mute"
              onClick={handleMuteClick}
            />
          )}
          {user.role !== "OWNER" && (
            <ActionButtons
              $isactive={isAdminActive}
              src={adminIcon}
              alt="Admin"
              onClick={handleAdminClick}
            />
          )}
        </SocialActions>
      )}
      <button onClick={handleChallenge}>
        <span className="icon-before" />
      </button>
      <UserStatus $userstatus={status}>{EditedUserStatus}</UserStatus>
    </UserDetails>
  );
};

export default UserInfo;

