import Landing from "./Landing";
import PageContainer from "../components/PageContainer";
import ProfileAvatar from "../components/profile_components/ProfileAvatar";
import UserStats from "../components/profile_components/UserStats";
import MatchHistory from "../components/profile_components/MatchHistory";
import AchievementsInfos from "../components/profile_components/AchievementsInfos";
import styled from "styled-components";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router";
import { GameListInter } from "../components/profile_components/MatchElement";

interface Profile {
  avatarPath: string;
  userName: string;
  userstatus: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  achievements: string[];
  place: number;
  matchHistory: GameListInter[];
}

interface profileLead {
  avatar: string;
  gamesPlayed: number;
  gamesWon: number;
  place: number;
  userName: string;
}

const ProfileContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;

  @media (max-width: 1480px) {
    display: flex;
    flex-direction: column; /* Switch to a column layout */
    align-items: center;
  }
`;

const LeftColumn = styled.div`
  flex: 1;
`;

const RightColumn = styled.div`
  flex: 1;
`;

const Profile: React.FC = () => {
  const { username } = useParams<{ username?: string }>();
  const profileUsername = username ?? '';
  const [profileData, setProfileData] = useState<Profile>({
    avatarPath: "", // Provide a default value for avatarPath
    userName: "", // Provide a default value for userName
    userstatus: "", // Provide a default value for userstatus
    gamesPlayed: 0, // Provide a default value for gamesPlayed
    gamesWon: 0, // Provide a default value for gamesWon
    gamesLost: 0, // Provide a default value for gamesLost
    achievements: [], // Provide a default value for achievements
    place: 0, // Provide a default value for place
    matchHistory: [] as GameListInter[], // Provide a default empty array of GameListInter
  });
  const [profilesList, setProfilesList] = useState<profileLead[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL
          }/user/gameHistory?userName=${profileUsername}`,
          {
            withCredentials: true,
          }
        );
        const userData = response.data;
        setProfileData((prevProfileData) => ({
          ...prevProfileData,
          avatarPath: userData.avatar,
          userName: userData.userName,
          userstatus: userData.status,
          gamesLost: userData.gamesLost,
          gamesWon: userData.gamesWon,
          gamesPlayed: userData.gamesLost + userData.gamesWon,
          achievements: userData.achievements,
          matchHistory: userData.games,
        }));

      } catch (error) {
        console.error(error);
      }
    };
    fetchUserData();
  }, [username]);

  const getProfilesList = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/leaderboard`,
        { withCredentials: true }
      );
      setProfilesList(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const profilePlace = profilesList.find(
      (profile: profileLead) => profile.userName === profileData.userName
    );

    if (profilePlace) {
      setProfileData((prevProfileData) => ({
        ...prevProfileData,
        place: profilePlace.place,
      }));
    }
  }, [profilesList, profileData.userName]);

  useEffect(() => {
    getProfilesList();
  }, [username]);

  return (
    <>
      <Landing />
      <PageContainer type="other">
        {profileData ? (
          <>
            <ProfileAvatar
              userstatus={profileData.userstatus}
              username={profileData.userName}
              avatarPath={profileData.avatarPath}
            />
            <ProfileContainer>
              <LeftColumn>
                <UserStats
                  gamesWon={profileData.gamesWon}
                  gamesPlayed={profileData.gamesPlayed}
                  place={profileData.place}
                />
                <AchievementsInfos achievements={profileData.achievements} />
              </LeftColumn>
              <RightColumn>
                <MatchHistory gameList={profileData.matchHistory} profileUser={profileUsername} />
              </RightColumn>
            </ProfileContainer>
          </>
        ) : (
          <h1>Loading</h1>
        )}
      </PageContainer>
    </>
  );
};

export default Profile;
