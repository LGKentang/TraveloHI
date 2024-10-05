// PaymentMethodDropdown.js
import React, { useState, useRef, useEffect } from "react";
import "../../styles/main/main.scss";
import "../../styles/components/NavbarMisc/LanguageCurrency.scss";
import { useCurrency } from "../../context/currency-provider";

const Currency = ({ name, isSelected }: any) => {
  const { updateCurrency } = useCurrency();
  return (
    <div
      onClick={() => {
        updateCurrency(name);
      }}
      className={`currency-method ${isSelected ? "selected-currency" : ""}`}
    >
      {/* <span className={`material-symbols-outlined`}>{icon}</span> */}
      <h3>
        {name} {isSelected && "(Selected)"}
      </h3>
    </div>
  );
};

const LanguageCurrencyConverter = () => {
  const { selectedCurrency } = useCurrency();
  const [clicked, setClicked] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const currencies = ["IDR", "USD", "EUR"];

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
        <h2 onClick={handleDropdownToggle}>Currency</h2>
        <span className="material-symbols-outlined">expand_more</span>
        </div>

        {clicked && (
          <div className="dropdown-content-c">
            <div className="dropdown-separator-c">
              <h2>Currency</h2>
              <h3>Available Currency:</h3>
              {currencies.map((curr) => (
                <Currency
                  key={curr}
                  name={curr}
                  isSelected={curr === selectedCurrency}
                />
              ))}
            </div>

            <div>
              <h2>Languages:</h2>
              <h3>Available Languages:</h3>

              <div className="dropdown-separator-c">
                <div className="dropdown-language-c">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg"
                    alt=""
                  />
                  <h2>English</h2>
                </div>
                <div className="dropdown-language-c">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/9/9f/Flag_of_Indonesia.svg"
                    alt=""
                  />
                  <h2>Indonesian</h2>
                </div>
              </div>
            </div>
            {/* <div className="payment-methods"></div> */}
          </div>
        )}
      </div>
    </>
  );
};

export default LanguageCurrencyConverter;
