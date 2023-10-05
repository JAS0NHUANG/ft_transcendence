import styled from "styled-components";

export const ConversationHeaderWrapper = styled.div`
	display: flex;
	justify-content: space-between;
    align-items: center;

	height: 70px;
	padding-left: 15px;
	padding-right: 15px;
	border-bottom: solid 1px white;

	img {
		width: 45px;
		height: 45px; 
	}
`;

export const RoomName = styled.h2`
	margin: 0px;
`;