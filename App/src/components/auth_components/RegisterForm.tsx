import Button from "./styles/Button.styled";
import Form from "./styles/Form.styled";
import Input from "./styles/Input.styled";
import HoverText from "./styles/HoverText.styled";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router";

export default function RegisterForm() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const signupDTO = {
      userName: userName,
      email: email,
      password: pass,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/local/signup`,
        signupDTO,
				{ withCredentials: true }
      );
      console.log(response.data.status);
      navigate("/landing");
    } catch (error) {
      handleLoginError(error as AxiosError);
    }
  };

  const handleLoginError = (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 403) {
        setLoginError("Username or email already in use");
      } else if (status === 400) {
        setLoginError("Wrong format password or email");
      } else {
        setLoginError("Sign up failed");
      }
    } else {
      setLoginError("Network error occured");
    }
  };

  return (
    <Form onSubmit={handleSubmit} loginError={loginError}>
      <h1>Sign Up</h1>
      <Input
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="username"
        autoComplete="username"
      />
      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
        autoComplete="email"
      />
      <Input
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        placeholder="password"
        autoComplete="current-password"
      />
      <HoverText>ⓘ requirements</HoverText>
      <Button type="submit">Create an account</Button>
    </Form>
  );
}
