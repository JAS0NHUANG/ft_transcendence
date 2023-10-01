import styled from "styled-components";

export const AchievementsStyled = styled.div`
	display: flex;
	justify-content: flex-start;
	align-items: flex-start;
	flex-direction: column;	
	width: 531px;
	height: 208px;
	margin-left: 60px;
	margin-right: 35px;
	flex-shrink: 0; 

	h1{
		color: #FFF;
		font-size: 20px;
		font-style: normal;
		font-weight: 500;
		letter-spacing: 0.4px;
		padding-top: 5%;
		margin: 3px;
		text-align: right;
	}
`;

export const AchievementsBlock = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	width: 530px;
	height: 130px;
	flex-shrink: 0;
`

export const AchievementImage = styled.img`
  &:hover + div {
    display: block;
  }
`;

export const AchievementMessage = styled.div`
  display: none; /* Initially hide the message */

	/* Add styles for visibility */
  width: 98px;
  height: max-content;
  flex-shrink: 0;
  border: 1px solid #FFF;
  background: #000;

  color: #D8D8D8;
  font-size: 10px;
  font-style: normal;
  font-weight: 500;
  line-height: 12px; /* 150% */

  &:hover {
    display: block;
  }

  h1{
    margin: 0;
    padding: 0;
    color: #FFF;
    text-align: center;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    letter-spacing: 0.24px;
  }
`;