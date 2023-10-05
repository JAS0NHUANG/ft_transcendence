import React from "react";
import styled from "styled-components";

export type ProfileAvatar = {
  children?: React.ReactNode;
  User?: () => void;
  userImageSrc?: string;
  $userstatus: string;
};

export const ProfileAvatarStyled = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  margin: 50px;
  margin-bottom: 5px;

  /* Media query for screens less than 400px wide */
  @media (max-width: 1150px) {
    flex-direction: column; /* Switch to a column layout */
    align-items: center; /* Center items horizontally */
    margin: 5%;
  }
`;

export const AvatarImage = styled.img`
  width: 139.809px;
  height: 136px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 139.809px;
  border: 2px solid var(--linear-white, #faf2f2);
  background: url(<path-to-image>), lightgray 50% / cover no-repeat;

  margin-right: 20px;
`;

const statusColors = {
  ONLINE: "green",
  OFFLINE: "red",
  PLAYING: "blue",
  AWAY: "orange",
};

export const UserStatus: React.FC<ProfileAvatar> = styled.div`
  display: flex;
  text-align: center;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: 100%; /* 466.667% */
  letter-spacing: 0.3px;
  color: ${(props) =>
    statusColors[props.$userstatus as keyof typeof statusColors] || "white"};
`;

export const ProfileInfoBlock = styled.div`
  width: 159.641px;
  height: 107px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;

  h1 {
    color: white;
    /* display: flex; */
    font-size: 30px;
    font-style: normal;
    font-weight: 500;
    line-height: 200%; /* 233.333% */
    letter-spacing: 0.6px;
    margin: 0;
  }
`;

export const CodeBar = styled.img`
  display: flex-end;
  width: 260px;
  height: 140px;
`;

export const SocialOption = styled.div`
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
  margin-top: 2%;

  button {
    display: flex;
    align-items: center; /* Center button content vertically and horizontally */
    border-top: 1px solid #fff;
    border-left: 1px solid #fff;
    background: #000;
    box-shadow: 2px 2px 0px 0px rgba(157, 157, 157, 0.25);
    margin: 5%;
    color: #fff;
    font-size: 10px;
    font-style: normal;
    font-weight: 400;
    line-height: 200%; /* 700% */
    letter-spacing: 0.2px;
    min-width: auto; /* Adjust width to fit content */
    white-space: nowrap; /* Prevent text from wrapping */

    .icon-before::before {
      content: "";
      display: inline-block;
      width: 8px; /* Adjust the size of the icon */
      height: 8px; /* Adjust the size of the icon */
      background-image: url("/icon/Challenge.svg"); /* Set the correct URL for the background image */
      background-size: cover;
      margin-right: 5px; /* Add some spacing between the icon and text */
    }
  }
`;
