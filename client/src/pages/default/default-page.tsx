import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DefaultPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/home");
  }, [navigate]);

  return (
    <>
      <h1>Redirecting you to Home Page ...</h1>
    </>
  );
}
