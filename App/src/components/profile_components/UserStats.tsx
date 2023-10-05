import React from "react";
import {
  UserStatsStyled,
  UserStatsBlock,
  Rank,
  WinRateBlock,
  WinLossBar,
} from "./styles/UserStats.styled";

type UserStatsProps = {
  gamesPlayed: number;
  gamesWon: number;
  place: number;
};

const UserStats: React.FC<UserStatsProps> = ({
  gamesPlayed,
  gamesWon,
  place,
}) => {
  return (
    <UserStatsStyled>
      <Rank>#RANK {place}</Rank>
      <UserStatsBlock>
        <h1>Win Rate</h1>
        <WinRateBlock>
          <span>
            <p>Match Played : {gamesPlayed}</p>
            <p>Match Won : {gamesWon}</p>
            <p>Match Lost : {gamesPlayed - gamesWon}</p>
          </span>
          <WinLossBar $winRatio={gamesWon / gamesPlayed} />
        </WinRateBlock>
      </UserStatsBlock>
    </UserStatsStyled>
  );
};

export default UserStats;
