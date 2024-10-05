import { FormEvent, useState } from "react";
import TextField from "../../../components/text-field";
import { Link, useNavigate } from "react-router-dom";
import Button, { ButtonType } from "../../../components/button";
import ReCAPTCHA from "react-google-recaptcha";
import "../../../styles/main/main.scss";

export default function OtpLogin() {
  const [otpLoginError, setOtpLoginError] = useState("");
  const [captcha, setCaptcha] = useState(false);
  const navigate = useNavigate();

  const captchaComplete = () => {
    setCaptcha(true);
  };

  const captchaExpired = () => {
    setCaptcha(false);
  };

  const handleRequestOtp = async (e: FormEvent<HTMLFormElement>) => {
    setOtpLoginError("");
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const response = await fetch("http://localhost:3000/otp", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    });

    const data = await response.json();

    if (data.error !== undefined) {
      setOtpLoginError(data.error);
    } else {
      navigate('/login/otp/verify', { state: { email: email } });
    }
  };

  return (
    <>
      {
      (
        <div className="login-page">
          <form onSubmit={handleRequestOtp} className="form-group paper">
            <div className="expand">
              <span
                onClick={() => navigate("/login")}
                className="material-symbols-outlined back-btn"
              >
                arrow_back
              </span>
              <h2>OTP Login</h2>
            </div>
            <TextField label="Email" name="email"></TextField>
            <p className="error-login">{otpLoginError}</p>
            <Button
              onClick={() => {}}
              text="Login with OTP"
              type={ButtonType.SECONDARY}
            ></Button>
            {/* <ReCAPTCHA
              sitekey="6Ld-yVApAAAAANfOPoiWQJnveOmXbjSnL1IkZFsW"
              onChange={captchaComplete}
              onExpired={captchaExpired}
            /> */}

            <Link to={"/forgot-password"}>Forgot Password?</Link>
          </form>
        </div>
      )
      
      }
    </>
  );
}
