import styled from "styled-components";
import { StyledConfirmButton } from "../../settings_components/styles/ConfirmButton.styled";

export const ChatNavigationStyled = styled.div`

	/* border: solid 1px white; */
	margin: 18px;
	width: 350px;
	height: 604px;

	.buttons {
		margin-top: 10px;
		display: flex;
		justify-content: space-between; /* Horizontally justify the children */
	}

	${StyledConfirmButton} {
		width: 150px;
		height: 46px;
		color: #000;
		font-size: 15px;
		font-style: normal;
		font-weight: 500;
		letter-spacing: 0.36px;
	}
`;