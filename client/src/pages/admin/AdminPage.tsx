import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "../../styles/admin/admin.scss";
import "../../styles/main/main.scss";
import TextField from "../../components/text-field";
import Button, { ButtonType } from "../../components/button";
import MultiValueSlider from "../../components/slider/multi-value-slider";
import MultiRangeSlider from "../../components/slider/multi-value-slider";
import CameraCapture from "../../components/camera/camera-capture";

export default function AdminPage() {
  const [users, setUsers] = useState<any>(null);
  const [msg, setMsg] = useState<string>("");

  const sendEmails = async () => {
    const response = await fetch(
      "http://localhost:3000/api/user/sendSubscriptionEmail",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: msg,
        }),
      }
    );
    const data = await response.json();
    console.log(data);
  };

  const banUser = async (email: string) => {
    const response = await fetch(
      `http://localhost:3000/api/user/ban/${email}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      }
    );
    const data = response.json();
    console.log(data);
  };

  const getAuth = async () => {
    const response = await fetch("http://localhost:3000/admin", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();
    if (data.status !== "admin") {
      navigate("/login");
    }
  };

  useEffect(() => {
    (async () => {
      const response = await fetch("http://localhost:3000/api/user/all/all", {
        method: "GET",
      });
      const data = await response.json();
      console.log(data);
      setUsers(data);
    })();
  }, []);

  console.log(users);

  const navigate = useNavigate();

  useEffect(() => {
    getAuth();
  }, []);

  return (
    <>
      <div className="middleize nav-pad">
        <div className="paper admin-page">
          <div
            className="paper"
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "30%",
              gap: "20px",
            }}
          >
            <h2>Users</h2>
            {users &&
              users.map((u: any, index: number) => {
                return (
                  <div className="paper" key={index}>
                    <p>{u.Email}</p>
                    <p>
                      {u.FirstName} {u.LastName}
                    </p>

                    {u.Role === "admin" ? (
                      ""
                    ) : u.IsBanned === false ? (
                      <button
                        onClick={() => {
                          banUser(u.Email);
                        }}
                      >
                        Ban
                      </button>
                    ) : (
                      "User is banned"
                    )}
                  </div>
                );
              })}
          </div>

          <div
            className="paper"
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "30%",
              gap: "20px",
            }}
          >
            <h2>Send Email</h2>
            <TextField
              type="text"
              label="Subscription Message"
              name="message"
              onchange={(e) => setMsg(e.target.value)}
            ></TextField>
            <Button
              onClick={sendEmails}
              type={ButtonType.PRIMARY}
              text="Send"
            ></Button>
          </div>
        </div>
      </div>
    </>
  );
}
