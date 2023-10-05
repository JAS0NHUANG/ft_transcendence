import styled from "styled-components";

export const SearchBarWrapper = styled.div`
	height: 35px;
	display: flex;
	flex-direction: column; /* Arrange children vertically */
	align-items: center;
	
	@media screen and (max-width: 940px) {
		align-items: flex-start;
	}

	input {
		height: 23px;
		width: 215px;
		margin-left: 10px;
		color: white;
		text-align: center;
		background-color: rgba(255, 255, 255, 0.20); /* Inner background color */
		font-family: "JetBrains Mono",monospace;
		font-size: 13px;
	}

	input::placeholder {
		color: rgba(250, 242, 242, 0.7)
	}

	.dataResultContainer {
		z-index: 1; /* Make sure it appears in front of other elements */
	}

	.dataResult {
		background-color: #323131;
		// border: 1px solid #ccc; /* Optional: Add a border */
		border-radius: 2px;
		padding: 5px; /* Optional: Add padding */
		// margin: 1px;
		// z-index: 1; /* Make sure it appears in front of other elements */
	  }

`;