import { FormEvent, useState, useRef, useEffect } from "react";
import TextField from "../../components/text-field";
import "../../styles/main/main.scss";
import Button, { ButtonType } from "../../components/button";
import useUser from "../../context/user-provider";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

const isValidEmail = (email: string) => {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
};

export default function LoginComponent() {
  const { user, login } = useUser();
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const [captcha, setCaptcha] = useState(false);

  const captchaComplete = () => {
    setCaptcha(true);
  };

  const captchaExpired = () => {
    setCaptcha(false);
  };

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, []);

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!captcha) {
      setLoginError("Please complete the reCAPTCHA verification.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // if (!isValidEmail(email)) {
    //   setLoginError("Please enter a valid email address.");
    //   return;
    // }

    const response = await login(email, password);

    if ("error" in response) {
      setLoginError(response.error);
    } else {
      navigate("/home");
      window.location.reload();
    }
  };

  const renderLoginComponent = () => {
    return (
      <form onSubmit={handleLoginSubmit} className="form-group paper">
        <>
          <h2>Login/Daftar</h2>

          <TextField label="Email" name="email"></TextField>
          <TextField
            label="Password"
            name="password"
            type="password"
          ></TextField>
          <p className="error-login">{loginError}</p>
          <Button
            onClick={() => {}}
            text="Login"
            type={ButtonType.PRIMARY}
          ></Button>

          <ReCAPTCHA
            sitekey="6Ld-yVApAAAAANfOPoiWQJnveOmXbjSnL1IkZFsW"
            onChange={captchaComplete}
            onExpired={captchaExpired}
          />

          <Button
            onClick={() => {
              navigate("/login/otp");
            }}
            text="Login with OTP"
            type={ButtonType.SECONDARY}
          ></Button>

          <Link to={"/forgot-password"}>Forgot Password?</Link>
          <Link to={"/register"}>New to TraveloHI? Register Here</Link>
        </>
      </form>
    );
  };

  return (
    <>
      <div className="login-form ">{renderLoginComponent()}</div>
    </>
  );
}
