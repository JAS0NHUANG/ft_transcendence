import axios from 'axios';
import React, { useState, useEffect } from 'react';
import backgroundImg from "../../assets/code-barre.png";
import { Avatar, CodeBar, GamesPlayed, GamesWinned, ProfileContainer, ProfilesListWrapper, Rank, Username, CustomLink } from './styles/Profiles.styled';

interface Profile {
	avatar: string;
	gamesPlayed: number;
	gamesWon: number;
	place: number;
	userName: string;
}

const Profiles: React.FC = () => {
  const [profilesList, setProfilesList] = useState<Profile[]>([]);

  const getProfilesList = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/leaderboard`,
        { withCredentials: true }
      );
      console.log(response);
      setProfilesList(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProfilesList();
  }, []); // Add an empty dependency array to run this effect only once

  return (
    <ProfilesListWrapper>
        {Item(profilesList)}
    </ProfilesListWrapper>
  );
}

export default Profiles;

function Item(data: Profile[]) {
  return (
    <>
      {data.map((value, index) => (
        <CustomLink to={`/profile/${value.userName}`} key={index}>
          <ProfileContainer>
            <div className="code-barre">
              <CodeBar src={`${backgroundImg}`} alt="code-barre" />
            </div>
            <div className="avatar">
              <Avatar src={`data:image/png;base64,${value.avatar}`} alt="user_avatar" />
            </div>
            <Username>{value.userName}</Username>
            <GamesWinned>{value.gamesWon} <span>Wins</span></GamesWinned>
            <GamesPlayed>{value.gamesPlayed} <span>Played</span></GamesPlayed>
            <Rank>{typeof window !== 'undefined' && window.innerWidth >= 960 ? `#Rank ${value.place}` : `#${value.place}`}</Rank>
          </ProfileContainer>
        </CustomLink>

      ))}
    </>
  );
}
