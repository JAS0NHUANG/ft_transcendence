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
  
  width: 898px;
  height: 580px;

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

  .header {
    display: flex;
	  justify-content: space-between;
    align-items: center;

    padding: 10px;

    img {
      width: 35px;
      height: 35px;
    }
  }

  .lists_container {
    display: flex;
    justify-content: space-around;
  }

  .channel_container {
    width: 400px;
    height: 484px;

    margin: 15px;
    border: 1px solid #FFF;
  }

  .channel_container p {
    margin-left: 15px;
    font-style: normal;
    font-weight: 700;
    font-size: 16px;
    
}


  .buttons_container {
    display: flex;
    justify-content: space-between;
    margin: 15px;
  }

`;