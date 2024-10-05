import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TextField from "../../../components/text-field";
import Button, { ButtonType } from "../../../components/button";
import useUser from "../../../context/user-provider";
import "../../../styles/main/main.scss"

export default function OtpInput (){
    
    const {bypassLogin} = useUser()
    const navigate = useNavigate();
    const [otpInputError, setOtpInputError] = useState("");
    const [otpInputSuccess, setOtpInputSuccess] = useState("");

    const location = useLocation();
    const queryParams = new URLSearchParams(location.state);
    const emailParam = queryParams.get('email');
    const [email, setEmail] = useState(emailParam || '');

    const resendOtp = async () => {
      await fetch("http://localhost:3000/otp", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
      });
    }
    
    
    const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        const formData = new FormData(e.currentTarget);
        const otp = formData.get("OTP") as string;
        const response = await fetch("http://localhost:3000/otpLogin", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Email: email,
            Otp: otp,
          }),
        });
        const data = await response.json();
        if (data.error) {
          setOtpInputError(data.error);
        } else {
          bypassLogin(email)
          setOtpInputSuccess("Success, logging you in now...");
          setTimeout(() => {
            navigate('/home'); 
            window.location.reload()
          }, 1000);
        }
        console.log(data)
      };
    
    return <div className="login-page">
    <form onSubmit={handleVerifyOtp} className="form-group paper">
      <>
        <div className="expand">
          <span
            onClick={()=>navigate("/login/otp")}
            className="material-symbols-outlined back-btn"
          >
            arrow_back
          </span>
          <h2>OTP Login</h2>
        </div>
        <TextField
          label="Input OTP (6 digits)"
          name="OTP"
        ></TextField>
        <p className="error-login">{otpInputError}</p>
        <p>{otpInputSuccess}</p>
        <Button
          onClick={() => {}}
          text="Submit OTP"
          type={ButtonType.PRIMARY}
        ></Button>
        <Button
          onClick={resendOtp}
          text="Resend OTP"
          type={ButtonType.SECONDARY}
        ></Button>
      </>
    </form>
  </div>
}