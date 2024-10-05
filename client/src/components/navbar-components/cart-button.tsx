import React, { useState } from "react";
import "../../styles/components/NavbarMisc/CartButton.scss";
import { useNavigate } from "react-router-dom";

const CartDropdown = ({totalHotel, totalFlight } : any) => {
  return (
    <div className="cart-dropdown">
      <p>Ongoing orders</p>
      <div className="cart-select">
      <span className="material-symbols-outlined">airplane_ticket</span>
      <p>{totalFlight}</p>
      </div>
      <div className="cart-select">
      <span className="material-symbols-outlined">hotel</span>
      <p>{totalHotel}</p>
      </div>
    </div>
  );
};

export default function CartButton({totalCart, totalHotel, totalFlight} : any) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleCartHover = () => {
    setIsHovered(true);
  };

  const handleCartLeave = () => {
    setIsHovered(false);
  };

  return (
    <>
      <div
        className={`cart-button`}
        onMouseOver={handleCartHover}
        onMouseLeave={handleCartLeave}
        onClick={()=>navigate("/cart")}
      >
        <span className="material-symbols-outlined">shopping_cart</span>
        {totalCart}
        {isHovered && <CartDropdown totalHotel = {totalHotel} totalFlight = {totalFlight}/>}
      </div>
    </>
  );
}
