import React, { useState } from "react";
import Button from "./styles/Button.styled";
import Form from "./styles/Form.styled";
import Input from "./styles/Input.styled";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router";
import fourtyTwoLogo from "../../assets/42_logo.png";
import { RegisterLink } from "./styles/RegisterLink.styled";

export type LoginFormProps = {
  openModal2FA: (nonce: string) => void;
};

const LoginForm: React.FC<LoginFormProps> = ({ openModal2FA }) => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loginDTO = {
      email: email,
      password: pass,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/local/login`,
        loginDTO,
        { withCredentials: true },
      );

      if (response.data.event === "2fa needed")
      {
        openModal2FA(response.data.nonce);
      }
      else
        navigate("/landing");
      // Logging response for now, should redirect when React routing is implemented
    } catch (error) {
      handleLoginError(error as AxiosError);
    }
  };

  const handleLoginError = (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 400) {
        setLoginError("Invalid email or password format");
      } else if (status === 403) {
        if (
          error.response.data &&
          typeof error.response.data === "object" &&
          "message" in error.response.data
        ) {
          setLoginError((error.response.data as any).message);
        }
      } else {
        setLoginError("Login failed");
      }
    } else {
      setLoginError("Network error occured");
    }
  };

  return (
    <Form onSubmit={handleSubmit} loginError={loginError}>
      <h1 style={{ marginBottom: "0px" }}>Connect</h1>
      <Button type="button">
        <a href={`${import.meta.env.VITE_BACKEND_URL}/auth/fourtytwo/login`}>
          Sign up with <img src={fourtyTwoLogo} alt="42 Logo" />
        </a>
      </Button>

      <p>――――― OR ――――― </p>
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
      <RegisterLink to="/auth/register">
        Don't have an account? Sign up here.
      </RegisterLink>
      <Button type="submit">Log In</Button>
    </Form>
  );
};

export default LoginForm;
