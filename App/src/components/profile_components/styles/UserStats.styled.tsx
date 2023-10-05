import styled from "styled-components";

export const UserStatsStyled = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  width: 531px;
  height: 208px;
  margin-left: 60px;
  margin-right: 35px;
  flex-shrink: 0;

  /* Media query for screens less than 400px wide */
  @media (max-width: 960px) {
    flex-direction: column; /* Switch to a column layout */
    align-items: center; /* Center items horizontally */
    justify-content: center;
    margin: 1%;
    margin-bottom: 100px;
  }
`;

export const UserStatsBlock = styled.div`
  width: 530px;
  height: 130px;
  flex-shrink: 0;
  border: 1px solid #fff;
  background: #000;
  box-shadow: 1px 2px 1px 0px rgba(255, 255, 255, 0.9);

  h1 {
    color: #fff;
    font-size: 20px;
    font-style: normal;
    font-weight: 500;
    letter-spacing: 0.4px;
    padding-top: 1%;
    margin: 1px;
    text-align: center;
  }

  @media (max-width: 850px) {
    height: 110%;
  }
`;

export const WinRateBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  span {
    display: flex;
    flex-direction: row;
    width: 80%;

    @media (max-width: 850px) {
      flex-direction: column;
      align-items: center; /* Center items horizontally */
    }
  }

  p {
    color: #fff;
    font-size: 11px;
    font-style: normal;
    font-weight: 500;
    letter-spacing: 0.2px;
    margin: 1%;
    margin-top: 2%;
    margin-bottom: 2%;
    padding: 10px;
    border: 1px solid #fff;
    border-radius: 1px;
    flex: 1; /* To evenly distribute space among the p elements */
    text-align: center; /* To center the text */
  }
`;

export const Rank = styled.div`
  color: #fff;
  font-size: 40px;
  font-style: normal;
  font-weight: 700;
  line-height: 70px; /* 175% */
  letter-spacing: 0.8px;
`;

interface WinLossBarProps {
  $winRatio: number;
  type?: "won" | "loss";
}

const WinLossBarContainer = styled.div`
  width: 80%;
  margin: 5px;
  height: 20px;
  background: #000;
  display: flex;
  align-items: center;
  border: 1px solid #fff;
  overflow: hidden;

  @media (max-width: 850px) {
    width: 50%;
  }
`;

const Bar = styled.div<WinLossBarProps>`
  flex-grow: ${(props) => props.$winRatio};
  height: 100%;
  background-color: ${(props) => (props.$winRatio > 0.5 ? "green" : "red")};
  background-image: linear-gradient(
    to right,
    ${(props) => (props.type == "loss" ? "red" : "blue")} 50%,
    #000 50%
  );
  background-size: 3px 100%;
`;

export const WinLossBar: React.FC<WinLossBarProps> = ({ $winRatio }) => (
  <WinLossBarContainer>
    <Bar $winRatio={1 - $winRatio} type="loss" />
    <Bar $winRatio={$winRatio} type="won" />
  </WinLossBarContainer>
);
