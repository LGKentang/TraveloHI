import { useState } from "react";
import "../../../styles/parts/baggage/baggage.scss";
import "../../../styles/main/main.scss";
import { useCurrency } from "../../../context/currency-provider";

export default function AddOnBaggage({ onselected, onclosemodal }: any) {
  const [selectedBaggage, setSelectedBaggage] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState<any>(null);
  const { toString } = useCurrency();

  const baggageSizes = [5, 10, 15, 20, 30, 40];
  const baggagePrices = [75000, 100000, 150000, 200000, 250000, 300000];

  const handleSelectBaggage = (index: number) => {
    setSelectedBaggage(baggageSizes[index]);
    setSelectedIndex(index);
    onselected(baggageSizes[index], baggagePrices[index]);
    onclosemodal();
  };

  const handleRemoveBaggage = () => {
    setSelectedBaggage(null);
    setSelectedIndex(null);
    onselected(null, null);
  }

  return (
    <>
      <div className="baggage-grid">
        {baggageSizes.map((size, index) => (
          <div key={index} className="baggage-item">
            <div
              onClick={() => handleSelectBaggage(index)}
              className="baggage-container paper"
            >
              <div className="weight-container">
                <h2>{size}</h2>
                <p>kg</p>
              </div>
              <h3>{toString(baggagePrices[index])}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="baggage-select-parent">
        <div className="baggage-selection">
          <h2>Selected Size :</h2>
          <div className="weight-container">
            {selectedBaggage ? (
              <>
                <h2>{selectedBaggage}</h2>
                <p>kg</p>
              </>
            ) : (
              <h2>-</h2>
            )}
          </div>
        </div>

        <div onClick={()=>handleRemoveBaggage()} className="ok-btn paper">
          <span className="material-symbols-outlined">delete</span>
        </div>
      </div>
    </>
  );
}
