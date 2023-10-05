import { useNavigate } from "react-router-dom";
import { HomeWrapper } from "../components/styles/HomeWrapper.styled";

const Home = () => {
  const navigate = useNavigate(); // Using useNavigate hook to handle navigation
  
  const handlePlayClick = () => {
    navigate("/auth"); // Navigating to the "/auth" route when the button is clicked
  };

  return (
    <HomeWrapper>
      <h1>Pong Story Short <span>3.0</span></h1>
      <div></div>
      <button onClick={handlePlayClick}>PLAY</button>
    </HomeWrapper>
  );
};

export default Home;