import React, { useEffect, useState } from "react";
import "../../../styles/main/main.scss";
import "../../../styles/parts/flight/SeatSelector.scss";
import Seat from "./seat";

export default function SeatSelector({
  flightId,
  airplane,
  airline,
  flight,
  selectedFlightClass,
  currentlySelectedSeat,
  onSeatSelected,
}: any) {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(
    currentlySelectedSeat as string | null
  );
  const [airplaneRows, setAirplaneRows] = useState(0 | airplane.SeatRows);
  const [airplaneCols, setAirplaneCols] = useState(0 | airplane.SeatCols);
  const [takenSeat, setTakenSeat] = useState<any>(null);

  // Division
  // First , Business, Economy
  // 10, 20 , 70

  useEffect(() => {
    // console.log(flightId, airplane)
    (async () => {
      const response = await fetch(
        `http://localhost:3000/api/flight/seats/${flightId}`
      );
      const data = await response.json();
      setTakenSeat(data[0].SeatsJSON);
      console.log(data[0].SeatsJSON);
    })();
  }, []);

  const renderLining = (text: string) => {
    return (
      <div className="lining">
        <hr />
        <p>{text}</p>
        <hr />
      </div>
    );
  };

  const renderSeat = () => {
    if (takenSeat) {
      const turnRowAndColIntoSeatNumber = (row: number, col: number) => {
        const colLabel = String.fromCharCode(65 + col);
        return `${row + 1}${colLabel}`;
      };

      const handleClickSeat = (seatNumber: string) => {
        setSelectedSeat(seatNumber);
        onSeatSelected(flightId, seatNumber);
      };

      return (
        <div className="seating-chart">
          <div className="seat">
            <div className="seat-row">
              {Array(airplaneRows)
                .fill(0)
                .map((_, i) => (
                  <React.Fragment key={i}>
                    {i === 0 && renderLining("First Class")}
                    {i === Math.floor(airplaneRows * 0.1) &&
                      renderLining("Business Class")}
                    {i === Math.floor(airplaneRows * 0.3) &&
                      renderLining("Economy Class")}
                    <div className="seat-col" key={i}>
                      {Array(airplaneCols)
                        .fill(0)
                        .map((_, j) => (
                          <Seat
                            key={j}
                            text={turnRowAndColIntoSeatNumber(i, j)}
                            seatClass={
                              takenSeat.includes(
                                turnRowAndColIntoSeatNumber(i, j)
                              )
                                ? "Taken"
                                : i < Math.floor(airplaneRows * 0.1)
                                ? "First Class"
                                : i < Math.floor(airplaneRows * 0.3)
                                ? "Business Class"
                                : "Economy Class"
                            }
                            onClicked={handleClickSeat}
                            selectedSeatClass={selectedFlightClass + " Class"}
                            isSelected={
                              selectedSeat === turnRowAndColIntoSeatNumber(i, j)
                            } // Pass isSelected prop
                          />
                        ))}
                    </div>
                  </React.Fragment>
                ))}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <div className="seat-selector-component">
        <div className="left-component-placeholder">
          <div className="seat-airline-logo-placeholder">
            <img src={airline.Logo} alt="" />
          </div>

          <div className="origin-to-destination">
            <h2>{flight.OriginAirport.Code}</h2>
            <span className="material-symbols-outlined">trending_flat</span>
            <h2>{flight.DestinationAirport.Code}</h2>
          </div>

          <div>
            <h2>{selectedFlightClass}</h2>
            <h2>Seat : {selectedSeat ? selectedSeat : "-"}</h2>
          </div>
        </div>

        <div className="right-component-placeholder paper">{renderSeat()}</div>
      </div>
    </>
  );
}
