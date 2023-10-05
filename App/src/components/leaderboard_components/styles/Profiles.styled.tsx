import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom'; // Import Link from react-router-dom

export const ProfilesListWrapper = styled.div`
	margin: 15px;
	padding: 15px;
	height: 477px;
	overflow: auto; // Add overflow to allow scrolling if content overflows
	font-family: "JetBrains Mono",monospace;

	/* Add scrollbar styles for WebKit browsers */
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #555;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

export const ProfileContainer = styled.div`
	height: 78px;
	margin: 15px;
	padding: 5px; /* Add padding to create space between the content and the border */

	border-top: 1px solid #FFF;
	border-left: 1px solid #FFF;
	background: #000;
	box-shadow: -1px -1px 0px 0px #5A5A5A inset;

	display: flex; // Align children horizontally
  	align-items: center; // Vertically center-align children
	justify-content: space-between; /* Horizontally justify the children */
	// gap: 10px; /* Add the gap property to control spacing between components */

	font-size: 18px;
	font-style: normal;
	font-weight: 500;
	letter-spacing: 0.36px;

	@media (max-width: 960px) {
  	display: flex;
    justify-content: flex-start;
	overflow: auto; /* Hide content that overflows the container */
	font-size: 18px;
  }
`;

export const CustomLink = styled(RouterLink)`
  text-decoration: none; /* Remove underline */
  color: inherit; /* Inherit the color */
  /* Add any additional styles here */
`;

export const CodeBar = styled.img`
	width: 92px;
	height: 45px;
`;

export const Avatar = styled.img`
	width: 58px;
	height: 58px;
	border-radius: 58px;
`;

export const Username = styled.div`
	width: 150px;
`;

export const GamesWinned = styled.div`
	width: 100px;
	height: 38px;
	border: 1px solid white;
	display: flex;
	flex-direction: column;
	padding: 10px;
`;

export const GamesPlayed = styled.div`
	width: 100px;
	height: 38px;
	border: 1px solid white;
	display: flex;
	flex-direction: column;
	padding: 10px;
`;

export const Rank = styled.div`
	margin-right: 8px;
	font-size: 45px;
	font-style: normal;
	font-weight: 550; /* Set the font weight to make it bold */

	@media (max-width: 960px) {
	font-size: 25px;
  }
`;