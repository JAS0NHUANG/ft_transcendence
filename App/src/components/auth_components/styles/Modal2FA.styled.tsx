import styled from "styled-components";

export const ModalContainer = styled.div`
z-index:999;
position: fixed;
left: 0;
top: 0;
width: 100%;
height: 100%;
display: flex;
align-items: center;
justify-content: center;
background-color: rgba(0, 0, 0, 0.5);
`;

export const PopUpWrapper = styled.div`
  display: flex;
  flex-direction: column; /* Stack children vertically */
  align-items: center; /* Center children vertically */
  justify-content: center; /* Center children horizontally */
  width: 30em;
  padding: 2rem;
  border-radius: 8px;
  border: 0.5px solid #000;
  background: rgba(226, 224, 224, 0.97);
  box-shadow: 0px 4px 6px 0px rgba(0, 0, 0, 0.25);
  color: #000;
  font-family: JetBrains Mono;
  font-style: normal;

  h2 {
    margin: 0px;
    text-align: center;
    font-size: 30px;
    font-weight: 700;
  }

  p {
    margin-top: 5px;
    color: rgba(0, 0, 0, 0.71);
    text-align: center;
    font-size: 12px;
    font-weight: 500;
    line-height: normal;
  }

  Input {
	text-align: center;
  }

  Button {
	margin: 10px;
	width: 150px;
  }
`;