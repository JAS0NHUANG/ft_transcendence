import styled from "styled-components";

export const ModalContainer = styled.div` // blur behind popup
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
  backdrop-filter: blur(1.5px); 
`;

export const PopUpWrapper = styled.div`
  display: flex;
  flex-direction: column; /* Stack children vertically */
  
  width: 524px;

  padding: 10px;

  border: 1px solid #FFF;
  background: #000;

  h2 {
    margin: 10px;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: 20px; /* 80% */
    letter-spacing: 0.5px; 
  }

  .form_container {
    display: flex;
    flex-direction: column;

    margin: 15px;
  }

  label {
    margin-top: 10px;
    margin-bottom: 10px;
    font-size: 16px;
    font-weight: 500;
    line-height: normal;
  }

  input {
		height: 23px;
		width: 215px;
    border: 1px solid #FFF;
		color: white;
		text-align: center;
		background-color: black; /* Inner background color */
		font-family: "JetBrains Mono",monospace;
		font-size: 12px;
	}

	input::placeholder {
		color: rgba(250, 242, 242, 0.7)
	}

  span {
    margin: 5px;
    margin-top: 10px;
    color: rgba(129, 129, 129, 0.83);
    font-size: 12px;
    font-style: normal;
    letter-spacing: 0.32px;
  }

  .buttons_container {
    display: flex;
    justify-content: space-between;
    margin: 20px;
  }

`;