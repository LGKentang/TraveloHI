import {
  IMenu,
  MENU_LIST,
  SHOW_MENU_BUTTON_ADMIN,
  SHOW_MENU_BUTTON_GUEST,
  SHOW_MENU_BUTTON_USER,
} from "../settings/menu-settings";
import { Link, useNavigate } from "react-router-dom";
import "../styles/main/main.scss";
import "../styles/components/Navbar.scss";
import Button, { ButtonType } from "./button";
import useUser from "../context/user-provider";
import SearchBar from "./navbar-components/searchbar";
import PaymentMethodDropdown from "./navbar-components/payment-method-dropdown";
import LanguageCurrencyConverter from "./navbar-components/language-currency-converter";
import CartButton from "./navbar-components/cart-button";
import { useEffect, useState } from "react";

export default function NavigationBar() {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const usedList = user?.Role === "admin" ? SHOW_MENU_BUTTON_ADMIN : user?.Role === "user" ? SHOW_MENU_BUTTON_USER : SHOW_MENU_BUTTON_GUEST;
  const [totalCartItems, setTotalCartItems] = useState<any>(null);
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setVisible(
        (prevScrollPos > currentScrollPos &&
          prevScrollPos - currentScrollPos > 70) ||
          currentScrollPos < 10
      );
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prevScrollPos, visible]);


  useEffect(()=>{
    if (user){
      (async()=>{
        const response = await fetch(`http://localhost:3000/api/cart/total/items/${user?.Id}`);
        const data = await response.json();
        setTotalCartItems(data);
        console.log(data)
      })()
    }
  },[user])


  return (
    <div className={`navbar ${visible ? "" : "hiding-nav"}`}>
      <div className="logo-container">
        <img
          className="main-logo"
          onClick={() => navigate("/home")}
          src="https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/logo%2Flogo.png?alt=media&token=0648ae32-5cd2-4723-81fc-7869e53a5480"
          alt=""
        />
      </div>

      
      <SearchBar></SearchBar>

      {
        user && totalCartItems && <CartButton totalCart = {totalCartItems.totalItems} totalHotel = {totalCartItems.hotelCount} totalFlight = {totalCartItems.flightCount}/>
      }

      <LanguageCurrencyConverter></LanguageCurrencyConverter>
      <PaymentMethodDropdown></PaymentMethodDropdown>

      <div className="nav-links">
        {MENU_LIST.map((menu: IMenu, index: number) => {
          if (usedList.includes(menu.name))
            return (
              <div className="btn primary" key={index}>
                <Link key={index} to={menu.path} className="link">
                  {menu.name}
                </Link>
              </div>
            );
        })}
        {user && (
          <>
          <div className="black-box-container" onClick={()=>{navigate("/profile")}} style={{display:'flex',alignItems:'center', gap:'5px'}}>
            <div style={{color:'white', display:'flex',alignItems:'end', flexDirection:'column'}}>
              <p>Welcome,</p>
              <p>{user?.Email && user.Email.length > 7 ? user.Email.substring(0, 7) + "..." : user?.Email}</p>
            </div>
          <span className="material-symbols-outlined user-icon">
account_circle
</span>

          </div>
            {/* <div className="user-email-text">{user.Email}</div> */}

            <Button
              onClick={logout}
              children={
                <span className="material-symbols-outlined">logout</span>
              }
              type={ButtonType.PRIMARY}
            ></Button>
          </>
        )}
      </div>

      {/* <div className="navbar-container">


        
      </div> */}
    </div>
  );
}
