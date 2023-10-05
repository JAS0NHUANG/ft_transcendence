import React from "react";
import {
  AchievementsBlock,
  AchievementsStyled,
  AchievementImage,
  AchievementMessage,
} from "./styles/AchievementsInfos.styled";

interface Achievement {
  id: number;
  name: string;
  imagePath1: string;
  imagePath2: string;
  message: string;
}

type AchievementInfosProps = {
  achievements: string[];
};

const AchievementsInfos: React.FC<AchievementInfosProps> = ({
  achievements
}) => {
  const badges: Achievement[] = [
    {
      id: 1,
      name: "FRIEND",
      imagePath1: "/icon/Friend_Lock.svg",
      imagePath2: "/icon/Friend_Unlock.svg",
      message: "Invite your first friend",
    },
    {
      id: 2,
      name: "JOIN",
      imagePath1: "/icon/Join_Lock.svg",
      imagePath2: "/icon/Join_Unlock.svg",
      message: "Join your first channel",
    },
    {
      id: 3,
      name: "TWOFA",
      imagePath1: "/icon/Twofa_Lock.svg",
      imagePath2: "/icon/Twofa_Unlock.svg",
      message: "Secure your account with 2FA authentification",
    },
    {
      id: 4,
      name: "FIRST",
      imagePath1: "/icon/First_Lock.svg",
      imagePath2: "/icon/First_Unlock.svg",
      message: "Be the first of the matrix",
    },
    {
      id: 5,
      name: "WINNER",
      imagePath1: "/icon/Winner_Lock.svg",
      imagePath2: "/icon/Winner_Unlock.svg",
      message: "Win a game",
    },
  ];

  return (
    <AchievementsStyled>
      <h1>Achievements</h1>
      <AchievementsBlock>
        {badges.map((badge) => (
          <div key={badge.id}>
            <AchievementImage
              src={
                achievements.includes(badge.name)
                  ? badge.imagePath2
                  : badge.imagePath1
              }
              alt={`Achievement ${badge.id}`}
            />
            <AchievementMessage>
              <h1>{badge.name}</h1>
              {badge.message}
            </AchievementMessage>
          </div>
        ))}
      </AchievementsBlock>
    </AchievementsStyled>
  );
};

export default AchievementsInfos;
