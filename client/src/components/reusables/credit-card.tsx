import "../../styles/parts/credit-card/CreditCard.scss";

interface ICreditCard {
  digits?: number |null;
  name?: string | null;
  expirationMonth?: number | null;
  expirationYear?: number | null;
}

export default function CreditCard({
  digits,
  name,
  expirationMonth,
  expirationYear,
}: ICreditCard) {
    const formatCreditCardNumber = (digits: number | null) => {
        if (!digits) return "XXXX-XXXX-XXXX-XXXX";
    
        const digitString = digits.toString();
    
        // Insert hyphens every four digits
        const formattedDigits = digitString.replace(/(\d{4})(?=\d)/g, "$1-");
    
        return formattedDigits;
    };
    
  const monthFormatter = (expirationMonth: number) => {
    return expirationMonth.toString().padStart(2, "0");
  };

  const yearFormatter = (expirationYear: number) => {
    return expirationYear.toString().padStart(2, "0");
  };

  return (
    <>
      <div className="card-object">
        <div className="credit-card">
          <div className="chip"></div>
          <div className="card-number">
            {digits ? formatCreditCardNumber(digits) : "XXXX-XXXX-XXXX-XXXX"}
          </div>
          <div className="card-holder">{name ? name : "Card Holder"}</div>
          <div className="expiry-date">
            <span>
              {expirationMonth ? monthFormatter(expirationMonth) : "MM"}/
              {expirationYear ? yearFormatter(expirationYear) : "YY"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
