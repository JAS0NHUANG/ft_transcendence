import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MatchHistoryStyled,
  HistoryScrollingList,
} from "./styles/MatchHistory.styled";
import MatchElement, { GameListInter } from "./MatchElement";

type MatchHistoryProps = {
  gameList: GameListInter[];
  profileUser: string;
};

const MatchHistory: React.FC<MatchHistoryProps> = ({ gameList, profileUser }) => {

  const [loggedUserName, setLoggedUserName] = useState<string>("");
  const [isMyProfile, setIsMyProfile] = useState<boolean>(true);

  const uniqueGameList = gameList.filter((game, index, self) => {
    const createdAtString = new Date(game.createdAt).toISOString();
    return self.findIndex((g) => new Date(g.createdAt).toISOString() === createdAtString) === index;
  });

  const checkIsMyProfile = () => {
    return loggedUserName === profileUser;
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
        setLoggedUserName(response.data.userName);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    setIsMyProfile(checkIsMyProfile());
  }, [loggedUserName, profileUser]);

  return (
    <MatchHistoryStyled>
      <h1>Match History</h1>
      <HistoryScrollingList>
        {uniqueGameList.slice().reverse().map((game, index) => (
          <MatchElement key={index} game={game} profileUser={profileUser} isMyProfile={isMyProfile} />
        ))}
      </HistoryScrollingList>
    </MatchHistoryStyled>
  );
};

export default MatchHistory;

