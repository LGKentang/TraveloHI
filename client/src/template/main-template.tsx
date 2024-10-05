import { useNavigate } from "react-router-dom";
import Footer from "../components/footer";
import NavigationBar from "../components/navbar";
import GameController from "../context/game-controller";
import { IChildren } from "../interface/children-interface";
import "../styles/main/template.scss";

export default function MainTemplate({ children }: IChildren) {
  const navigate = useNavigate();
  return (
    <div>
      <div className="">
      
        <div
          onClick={() => {
            navigate("/game");
          }}
          className="gundam"
        >
          <img
            src="https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/gundam.png?alt=media&token=ec627895-a966-4b66-adb4-29ed5ed930f3"
            alt=""
          />
        </div>
        <NavigationBar></NavigationBar>
      </div>
      <div className="">{children}</div>
      <Footer></Footer>
    </div>
  );
}
