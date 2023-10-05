import styled from "styled-components";
import JBRegular from "../../assets/fonts/JetBrainsMono-2.304/fonts/webfonts/JetBrainsMono-Regular.woff2";

export const HomeWrapper = styled.div`
	height: 100vh; /* Full height of the viewport */
	width: 100vw; /* Full width of the viewport */
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	// font-family: "JetBrains Mono", monospace;
	@font-face {
		font-family: "JetBrains Mono";
		src: url(${JBRegular}) format("woff2");
		font-weight: normal;
		font-style: normal;
	  }

	h1 {
		margin:37px;

		color: #FFF;
		font-size: 55px;
		font-style: normal;
		font-weight: 800;
		line-height: 70px; /* 127.273% */

		span {
			color: #FFF;
			font-size: 40px;
			font-style: normal;
			font-weight: 500;
			line-height: normal;
			opacity: 0.6;
		}
	}

	div {
		width: 1049.004px;
		height: 3px;
		background: #FAF2F2;
	}

	Button {
		width: 222px;
		padding: 10px;
		margin: 65px;
		border-radius: 3px;
		background: rgba(255, 255, 255, 0.92);
		box-shadow: -3px -10px 0px 0px rgba(0, 0, 0, 0.3) inset;

		/* font-family: JetBrains Mono; */
		color: #1E1E1E;
		font-size: 55px;
		font-style: normal;
		font-weight: 800;
		line-height: 70px; /* 127.273% */
		letter-spacing: 1.1px;
	}
`