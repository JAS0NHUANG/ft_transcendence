import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Avatar, FriendsListWrapper, FriendContainer, UserInfos, ProfileButton, CustomLink } from './styles/FriendsList.styled';

interface Friend {
	avatar: string;
	gamesLost: number;
	gamesWon: number;
	status: string;
	userName: string;
}

const FriendsList: React.FC = () => {
  const [FriendsList, setFriendsList] = useState<Friend[]>([]);

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

  useEffect(() => {
    getFriendsList();
  }, []); // Add an empty dependency array to run this effect only once

  return (
    <FriendsListWrapper>
        {Item(FriendsList)}
    </FriendsListWrapper>
  );
}

export default FriendsList;

function Item(data: Friend[]) {
  return (
    <>
      {data.map((value, index) => (
        <FriendContainer key={index}>
          <div className="avatar">
            <Avatar src={`data:image/png;base64,${value.avatar}`} alt="user_avatar" />
          </div>
          <UserInfos status={value.status.toLowerCase()}>
            {value.userName}<span>{value.status.toLowerCase()}</span>
          </UserInfos>
          <CustomLink to={`/profile/${value.userName}`}>
            <ProfileButton>See profile</ProfileButton>
          </CustomLink>
        </FriendContainer>
      ))}
    </>
  );
}
