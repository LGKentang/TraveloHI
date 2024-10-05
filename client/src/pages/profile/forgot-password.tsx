import { FormEvent, useEffect, useState } from "react";
import TextField from "../../components/text-field";
import useUser from "../../context/user-provider";
import "../../styles/components/profile/ForgotPassword.scss";
import { useNavigate } from "react-router-dom";
import Button, { ButtonType } from "../../components/button";
import { questions } from "../register/register-page";

export default function ForgotPassword() {
  const { user } = useUser();
  const [userData, setUserData] = useState<any>(null);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");
  const navigate = useNavigate();
  const debounce = <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ) => {
    let timeoutId: any;
    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };
  
  const getUserData = debounce( async (email : string) => {
    // if (user) {
      const response = await fetch(
        `http://localhost:3000/api/user/email/${email}`,
        { method: "GET" }
      );
      const data = await response.json();
      console.log(data)

      if (response.ok) setUserData(data);
      else setUserData(null)
    // }
  },500)

  console.log(userData)
  


  const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (userData){
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const securityAnswer = formData.get("securityAnswer") as string;

        // console.log(user.Email, password, securityAnswer)

        if (password.trim() === "" || securityAnswer.trim() === "") {
            setErrorText("Please fill in the fields");
            return;
        }

        const response = await fetch("http://localhost:3000/forgotPassword",
        {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
              password : password,
              securityAnswer : securityAnswer,
            }),
        });
        const data = await response.json();
        console.log(data)
        if (!response.ok){
            setErrorText(data.error)
        }
        else{
            setSuccessText("Password updated successfully, redirecting to login page..")
            setErrorText("")

            setTimeout(() => {
                navigate("/login")
            }, 1000);
        }
    }
  };
console.log(userData)
  return (
    <>
      <div className="forgot-password-page">

        <form onSubmit={handleForgotPassword} className="form-group paper">
        <h2>Forgot Password</h2>
        <div style={{display:'flex'}}>
        <TextField name='email' label="Email" onchange={(e)=>getUserData(e.target.value)}></TextField>
        {/* <Button text="Check Email" type={ButtonType.SECONDARY}></Button> */}
        </div>
        {userData &&
        <div>
            <h3>Question : {questions[userData.SecurityAnswerIndex]}</h3>
            <TextField name="securityAnswer" label="Answer"></TextField>
        </div>
       }
        <TextField name="password" label="New Password" type="password"></TextField>
        <p style={{color:'red'}}>{errorText}</p>
        <p style={{color:'green'}}>{successText}</p>
        <Button type={ButtonType.PRIMARY} text="Request new password"></Button>
      <a href="/login">Login</a>
        </form>
        
      </div>
    </>
  );
}
