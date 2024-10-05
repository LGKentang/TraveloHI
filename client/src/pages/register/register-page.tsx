import { useEffect, useRef, useState } from "react";
import Button, { ButtonType } from "../../components/button";
import TextField from "../../components/text-field";
import "../../styles/register/RegisterPage.scss";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AvatarEditor from "react-avatar-editor";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../firebase/firebase";
import CameraCapture from "../../components/camera/camera-capture";

export const questions = [
  `What is your favorite childhood pet's name?`,
  `In which city where you born?`,
  `What is the name of your favorite book or movie?`,
  `What is the name of the elementary school you attended?`,
  `What is the model of your first car?`,
];
export default function RegisterPage() {
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [file, setFile] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [captcha, setCaptcha] = useState(false);

  const navigate = useNavigate();

  const captchaComplete = () => {
    setCaptcha(true);
  };

  const captchaExpired = () => {
    setCaptcha(false);
  };
  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const cameraCaptureRef = useRef<any>(null);
  const handleCapture = (imageData: string) => {
    console.log("Received imageData:", imageData);

    // Remove data URL prefix
    const base64String = imageData.replace(/^data:image\/jpeg;base64,/, "");

    // Handle special characters
    const decodedString = atob(decodeURIComponent(base64String));

    // Convert the decoded string to a Uint8Array
    const byteCharacters = decodedString;
    const byteArrays = new Uint8Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays[i] = byteCharacters.charCodeAt(i);
    }

    // Create a Blob from the Uint8Array
    const blob = new Blob([byteArrays], { type: "image/jpeg" });

    // Set the Blob as the file state
    setFile(blob);

    // Create a URL for the Blob
    const imageUrl = URL.createObjectURL(blob);

    // Set the image preview URL
    setImagePreview(imageUrl);

    console.log(blob);
    console.log(imageUrl);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const age = formData.get("age") as string;
    const gender = formData.get("gender") as string;
    const dob = startDate.getTime();
    const subscribe = formData.get("subscribe");
    const securityAnswer = formData.get("securityAnswer");

    let subscribeToNewsLetter: boolean = true;
    if (subscribe === null) {
      subscribeToNewsLetter = false;
    }

    if (
      !email ||
      !password ||
      !confirmPassword ||
      !firstName ||
      !lastName ||
      !age ||
      !gender ||
      !dob ||
      !securityAnswer
    ) {
      // setErrorText("Please fill in the missing values");
      // return;
    } else if (!file) {
      setErrorText("Please set a profile picture");
      return;
    } else {
      // const nameRegex = /^[a-zA-Z]+$/;
      // const isFirstNameValid =
      //   firstName.length > 5 && nameRegex.test(firstName);
      // if (!isFirstNameValid) {
      //   setErrorText(
      //     "First name must be at least 5 characters and only contain alphabet"
      //   );
      //   return;
      // }
      // const isLastNameValid = lastName.length > 5 && nameRegex.test(lastName);
      // if (!isLastNameValid) {
      //   setErrorText(
      //     "Last name must be at least 5 characters and only contain alphabet"
      //   );
      //   return;
      // }

      // const parsedAge = parseInt(age, 10);

      // if (isNaN(parsedAge)) {
      //   setErrorText("Age must be a valid number");
      //   return;
      // }

      // const isAgeValid = parsedAge >= 13;

      // if (!isAgeValid) {
      //   setErrorText("Age must be at least 13 to register");
      //   return;
      // }
      // const passwordRegex =
      //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/;
      // const isPasswordValid = passwordRegex.test(password);
      // if (!isPasswordValid) {
      //   setErrorText(
      //     "Allowed characters for password are capital letters, lower-case letters, numbers, and special symbols, and has a length of 8 – 30 characters."
      //   );
      //   // console.log(passwordRegex.test('Darren0!!'))
      //   return;
      // }

      // if (password !== confirmPassword) {
      //   setErrorText("Confirm password must be the same as password");
      //   return;
      // }
      if (!captcha) {
        setErrorText("Please complete the reCAPTCHA verification.");
        return;
      }
      setErrorText("");
    }

    let imageUrl: string | undefined;

    const profilePicRef = ref(storage, `profile-picture/${email}.jpg`);
    await uploadBytes(profilePicRef, file!).then((snapshot) => {
      console.log("Uploaded a blob or file!");
    });

    try {
      const downloadURL = await getDownloadURL(profilePicRef);
      imageUrl = downloadURL;
    } catch (error) {
      console.error("Error getting download URL:", error);
    }

    const jsonData = {
      Email: email,
      Password: password,
      ConfirmPassword: confirmPassword,
      FirstName: firstName,
      LastName: lastName,
      Age: parseInt(age, 10),
      Gender: gender,
      Dob: dob.toString(),
      Subscribe: subscribeToNewsLetter,
      SecurityAnswer: securityAnswer,
      SecurityAnswerIndex: selectedOptionIndex,
      ProfilePicturePath: imageUrl,
    };

    console.log(jsonData);

    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessText(
          "Success registration, heading you to the login page..."
        );
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        console.log(data);
        setErrorText(data.error);
      }

      console.log("Response:", response);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (cameraCaptureRef.current) {
        cameraCaptureRef.current.stopCamera();
      }
      window.location.reload();
    };
  }, []);

  return (
    <>
      <div className="register-page">
        <form onSubmit={handleSubmit}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: "10px" }}>
            Register
          </h2>
          <div className="form-group-register paper">
            <div className="form-group-segment">
              <TextField label="Email" name="email"></TextField>
              <TextField
                label="Password"
                name="password"
                type="password"
              ></TextField>
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
              ></TextField>
            </div>
            <div className="form-group-segment">
              <TextField
                label="First Name"
                name="firstName"
                type="text"
              ></TextField>
              <TextField
                label="Last Name"
                name="lastName"
                type="text"
              ></TextField>
              <TextField label="Age" name="age" type="text"></TextField>
            </div>
            <div className="form-group-segment sb">
              <div>
                <label htmlFor="">Date of Birth</label>
                <div style={{ marginBottom: "13px" }}>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date!)}
                  />
                </div>

                <label htmlFor="">Gender</label>
                <div className="radio-group">
                  <div className="group-alignment">
                    Male
                    <input type="radio" name="gender" value="Male" />
                  </div>
                  <div className="group-alignment">
                    Female
                    <input type="radio" name="gender" value="Female" />
                  </div>
                </div>
              </div>

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div className="checkbox-group">
                  <label>
                    <input type="checkbox" name="subscribe" /> Subscribe to
                    Newsletter
                  </label>
                </div>
                <Button type={ButtonType.PRIMARY} text="Register"></Button>
              </div>
            </div>

            <div className="form-group-segment-2">
              <div className="form-group-register-questions paper">
                <div className="form-question-pp">
                  <h2>Profile Picture</h2>
                  <div className="icon-pp-manager">
                    <label htmlFor="fileInput">
                      <span
                        style={{ position: "relative", top: "3px" }}
                        className="material-symbols-outlined"
                      >
                        photo_library
                      </span>
                    </label>
                    <input
                      type="file"
                      id="fileInput"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                    <CameraCapture
                      onCapture={handleCapture}
                      ref={cameraCaptureRef}
                    ></CameraCapture>
                  </div>
                </div>
                {imagePreview && <img src={imagePreview} alt="Preview" />}
              </div>
              <div className="form-group-register-questions paper">
                <div className="form-question">
                  <h2>Security Questions</h2>
                  <select
                    className="custom-select"
                    onChange={(e) =>
                      setSelectedOptionIndex(e.target.selectedIndex)
                    }
                    value={
                      selectedOptionIndex !== -1
                        ? questions[selectedOptionIndex]
                        : ""
                    }
                  >
                    {questions.map((question, index) => (
                      <option key={index} value={question}>
                        {question}
                      </option>
                    ))}
                  </select>
                  <TextField
                    label="Answer"
                    type="text"
                    name="securityAnswer"
                  ></TextField>
                  <ReCAPTCHA
                    sitekey="6Ld-yVApAAAAANfOPoiWQJnveOmXbjSnL1IkZFsW"
                    onChange={captchaComplete}
                    onExpired={captchaExpired}
                  />
                </div>
              </div>
            </div>
          </div>
          <div style={{ width: "400px" }}>
            <p style={{ color: "red" }}>{errorText}</p>
            <p style={{ color: "green" }}>{successText}</p>
          </div>
        </form>
        {/* 
        <div>
          <div className="form-group-register-questions paper">
            <div className="form-question">
              <h2>Profile Picture</h2>
            </div>
          </div>

          <div className="form-group-register-questions paper">
            <div className="form-question">
              <h2>Security Questions</h2>
              <select
                className="custom-select"
                onChange={(e) => setSelectedOptionIndex(e.target.selectedIndex)}
                value={
                  selectedOptionIndex !== -1
                    ? questions[selectedOptionIndex]
                    : ""
                }
              >
                {questions.map((question, index) => (
                  <option key={index} value={question}>
                    {question}
                  </option>
                ))}
              </select>
              <TextField
                label="Answer"
                type="text"
                name="securityAnswer"
              ></TextField>
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
}

{
  /* <form onSubmit={handleLoginSubmit} className="form-group">
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
      onClick={() => {navigate("/login/otp")}}
      text="Login with OTP"
      type={ButtonType.SECONDARY}
    ></Button>

    <Link to={"/forgot-password"}>Forgot Password?</Link>
    <Link to={"/register"}>New to TraveloHI? Register Here</Link>
  </>
    </form> */
}
