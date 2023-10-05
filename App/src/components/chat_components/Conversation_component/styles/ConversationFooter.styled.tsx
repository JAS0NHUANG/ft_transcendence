import styled from "styled-components";
import { StyledConfirmButton } from "../../../settings_components/styles/ConfirmButton.styled";

export const ConversationFooterWrapper = styled.div`

	form {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-left: 15px;
		padding-right: 15px;
	}

	input {
		height: 30px;
		width: 420px;
		padding-left: 8px;
    	border: 1px solid #FFF;
		color: white;
		background-color: black; /* Inner background color */
		font-family: "JetBrains Mono",monospace;
		font-size: 12px;
	}

	input::placeholder {
		color: rgba(250, 242, 242, 0.7)
	}

	${StyledConfirmButton} {
		margin-top: 0px;
	}
`;

