import React, { useEffect, useState } from "react";
import BarCodeImg from "../../assets/code-barre.png";
import {
  ProfileAvatarStyled,
  AvatarImage,
  ProfileInfoBlock,
  UserStatus,
  CodeBar,
  SocialOption,
} from "./styles/ProfileAvatar.styled";
import axios from "axios";

type ProfileAvatarProps = {
  avatarPath: string;
  username: string;
  userstatus: string;
};

interface Friend {
  avatar: string;
  gamesLost: number;
  gamesWon: number;
  status: string;
  userName: string;
}

function toTitleCase(input: string) {
  return `• ${input
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")}`;
}

const ProfileAvatarBlock: React.FC<ProfileAvatarProps> = ({
  username,
  avatarPath,
  userstatus,
}) => {
  const [userName, setUserName] = useState<string>("");
  const userImageSrc = `data:image/png;base64,${avatarPath}`;
  const EditedUserStatus = toTitleCase(userstatus);
  const [FriendsList, setFriendsList] = useState<Friend[]>([]);

  const isOwnProfile = username === userName;
  const isFriend = FriendsList.some((friend) => friend.userName === username);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/me`,
          {
            withCredentials: true,
          }
        );
        setUserName(response.data.userName);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    getFriendsList();
  }, []); // Add an empty dependency array to run this effect only once

  const getFriendsList = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/friend/friendList`,
        { withCredentials: true }
      );
      console.log(response);
      setFriendsList(response.data.friendList);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddFriend = async () => {

    const updateDTO = {
      userName: username
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/friend/addFriend`,
        updateDTO,
        { withCredentials: true },
      );
      console.log(response);
      console.log(username + " succesfully added.");
      const newFriend: Friend = {
        avatar: "",       // Add your default values here
        gamesLost: 0,     // Add your default values here
        gamesWon: 0,      // Add your default values here
        status: "",       // Add your default values here
        userName: username,
      };

      setFriendsList([...FriendsList, newFriend]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUnfriend = async () => {

    const updateDTO = {
      userName: username
    };

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/friend/unfriend`,
        updateDTO,
        { withCredentials: true },
      );
      console.log(response);
      console.log(username + " succesfully unfriended.");
      setFriendsList(FriendsList.filter((friend) => friend.userName !== username));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ProfileAvatarStyled>
      <AvatarImage src={userImageSrc} />
      <ProfileInfoBlock>
        <h1>{username}</h1>
        <UserStatus $userstatus={userstatus}>{EditedUserStatus}</UserStatus>
        <>
          {!isOwnProfile && (
            <SocialOption>
              {isFriend ? (
                <button onClick={handleUnfriend}>- Unfriend</button>
              ) : (
                <button onClick={handleAddFriend}>+ Add</button>
              )}
              <button>x Block</button>
              <button>
                <span className="icon-before" /> Challenge Player
              </button>
            </SocialOption>
          )}
        </>
      </ProfileInfoBlock>
      <CodeBar src={`${BarCodeImg}`} alt="code-barre" />
    </ProfileAvatarStyled>
  );
};

export default ProfileAvatarBlock;