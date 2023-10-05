import styled from "styled-components";

export const MatchElementStyled = styled.div`
  width: 90%;
  height: 40px;
  flex-shrink: 0;
  border-top: 1px solid #fff;
  border-left: 1px solid #fff;
  background: #000;
  box-shadow: 2px 2px 0px 0px rgba(157, 157, 157, 0.25);
  margin-bottom: 5px; /* Add margin to separate MatchElement components */

  display: flex;
  justify-content: space-between;
  align-items: center; /* Center content vertically */
  padding: 0 10px; /* Add padding to adjust spacing */
`;

export const VersusInfo = styled.div`
  display: flex;
  align-items: center;

  img {
    max-width: 30px;
    height: auto;
    border-radius: 50%;
    margin-right: 10px; /* Increase margin for more spacing */
  }

  p {
    margin: 0;
    font-size: 12px;
  }
`;

export const ResultBadge = styled.div`
  width: 8px; /* Increase the size as needed */
  height: 8px; /* Increase the size as needed */
  border-radius: 50%; /* Make it a circle */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px; /* Adjust the font size */
  font-weight: bold;
  color: #fff; /* Text color */
  margin-left: 10px; /* Add margin to separate from text */
`;

export const WinBadge = styled(ResultBadge)`
  background-color: blue; /* Blue circle for Win */
`;

export const LostBadge = styled(ResultBadge)`
  background-color: red; /* Red circle for Lost */
`;

export const MarginContainer = styled.div`
  margin: 5%
`;