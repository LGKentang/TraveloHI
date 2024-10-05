// PaymentMethodDropdown.js
import React, { useState, useRef, useEffect } from "react";
import "../../styles/main/main.scss";
import "../../styles/components/NavbarMisc/PaymentMethod.scss";

// PaymentMethod component for individual payment methods
const PaymentMethod = ({ icon, name, description }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleHover = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className="payment-method"
      onMouseEnter={handleHover}
      onMouseLeave={handleMouseLeave}
    >
       
      <span className={`material-symbols-outlined`}>{icon}</span>
      <h3>{name}</h3>
   
      {isHovered && (
        <div className="info-card-overlay">
          <span className="material-symbols-outlined">arrow_left_alt</span>
          <div style={{width:'50px'}}></div>
          <div className="info-card paper">
            <h2>{name}</h2>
            {description}
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentMethodDropdown = () => {
  const [clicked, setClicked] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // Clicked outside the dropdown, close it
        setClicked(false);
      }
    };

    // Add event listener when component mounts
    document.addEventListener("click", handleClickOutside);

    // Remove event listener when component unmounts
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleDropdownToggle = () => {
    setClicked(!clicked);
  };

  return (
    <>
      <div className={`payment-method-dropdown`} ref={dropdownRef}>
      <div className="payment-method-object">
        <h2 onClick={handleDropdownToggle}>Pay</h2>
        <span className="material-symbols-outlined">expand_more</span>
        </div>

        {clicked && (
          <div className="dropdown-content-p">
            <h2>Payment</h2>
            <h3>Available Methods :</h3>

            <div className="payment-methods-p">
              <PaymentMethod
                icon="account_balance_wallet"
                name="HI-Wallet"
                description="Your go-to digital wallet for secure fund management. Make payments, track transactions, and enjoy seamless financial control."
              />
              <PaymentMethod
                icon="credit_card"
                name="Credit Card"
                description="Conveniently make purchases and manage expenses with the security and flexibility of credit facilities."
              />
              <PaymentMethod
                icon="qr_code_2"
                name="QRIS"
                description="Modern and efficient cashless payments. Swiftly and securely make transactions by scanning QR codes—experience hassle-free convenience."
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentMethodDropdown;