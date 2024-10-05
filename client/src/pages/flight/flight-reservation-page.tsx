import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/parts/flight/FlightReservationPage.scss";
import React, { useEffect, useState } from "react";
import LanguageCurrencyConverter from "../../components/navbar-components/language-currency-converter";
import Modal from "../../components/modal";
import Modalv2 from "../../components/modalv2";
import Modalv3 from "../../components/modalv3";
import SeatSelector from "./seat/seat-selector";
import { useCurrency } from "../../context/currency-provider";
import AddOnBaggage from "./baggage/add-on-baggage";
import Button, { ButtonType } from "../../components/button";
import useUser from "../../context/user-provider";

export default function FlightReservationPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.state);
  const query = queryParams.get("query");
  const [data, setData] = useState<any>([]);
  const [flightClass, setFlightClass] = useState<string>("Economy");
  const [selectedSeats, setSelectedSeats] = useState<any>({});
  const { toString } = useCurrency();
  const [addOnBaggage, setAddOnBaggage] = useState<any>(null);
  const [addOnBaggagePrice, setAddOnBaggagePrice] = useState<any>(null);
  const [reservationError, setReservationError] = useState<any>("");

  const [cartModalOpened, setCartModalOpened] = useState(false);
  const navigate = useNavigate();

  const toggleCartModal = () => {
    if (!user) {
      navigate("/login");
    }
    if (user && !cartModalOpened) {
      handleReservationFlight();
    }
  };

  console.log(query);

  const { user } = useUser();

  const handleCloseBaggageModal = () => {};

  const handleReservationFlight = async () => {
    if (user && query) {
      if (data && data.flight && Array.isArray(data.flight)) {
        if (
          data.additionalData.transits + 1 !==
          Object.keys(selectedSeats).length
        ) {
          setReservationError("*Please select all seats");
        } else {
          setReservationError("");
          console.log(JSON.stringify(selectedSeats));
          console.log(query);
          const response = await fetch(
            "http://localhost:3000/api/flight/reservation/create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_id: user.Id,
                transit: true,
                reservation_id: parseInt(query, 10),
                flight_class: flightClass === "First" ? "First-Class" : flightClass,
                seats: JSON.stringify(selectedSeats),
                add_on_baggage_price: addOnBaggagePrice === null ? 0 : addOnBaggagePrice,
                add_on_baggage_weight : addOnBaggage === null ? 0 : addOnBaggage,
              }),
            }
          );

          const data = await response.json();
          console.log(data);
          if (!response.ok){
            setReservationError(data.error);
          }
          else{
            setCartModalOpened(true);
          }
        }
      } 
      else if (data && data.flight) {
        if (
          1 !== Object.keys(selectedSeats).length
        ) {
          setReservationError("*Please select all seats");
        }
        else{
          const response = await fetch(
            "http://localhost:3000/api/flight/reservation/create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_id: user.Id,
                transit: false,
                reservation_id: parseInt(query, 10),
                flight_class: flightClass === "First" ? "First-Class" : flightClass,
                seats: JSON.stringify(selectedSeats),
                add_on_baggage_price: addOnBaggagePrice === null ? 0 : addOnBaggagePrice,
                add_on_baggage_weight : addOnBaggage === null ? 0 : addOnBaggage,
              }),
            }
          );
          if (!response.ok){
            setReservationError(data.error);
          }
          else{
            setCartModalOpened(true);
          }
        }
      }
    }
  };

  const handleSeatSelection = (flightId: any, seat: any) => {
    setSelectedSeats((prevSelectedSeats: any) => ({
      ...prevSelectedSeats,
      [flightId]: seat,
    }));
  };

  const handleBaggageSelected = (e: any, f: any) => {
    setAddOnBaggage(e);
    setAddOnBaggagePrice(f);
  };

  const handleClassOptionChange = (e: any) => {
    if (flightClass !== e.target.value) {
      setSelectedSeats({});
    }
    setFlightClass(e.target.value);
  };

  useEffect(() => {
    console.log(selectedSeats);
  }, [selectedSeats]);

  useEffect(() => {
    if (query) {
      (async () => {
        const response = await fetch(
          `http://localhost:3000/api/flight/schedule/${query}`
        );
        const data = await response.json();
        console.log(data);
        setData(data);
      })();
    }
  }, []);

  function convertDateToTime(date: any) {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      // hourCycle:'h23',
      // hour12: false,
    });
  }

  function convertDateToSimpleDate(date: any) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const parsedDate = new Date(date);
    const day = parsedDate.getDate();
    const monthIndex = parsedDate.getMonth();
    const month = months[monthIndex];

    return `${day} ${month}`;
  }

  function convertMinuteToHourAndMinute(minute: number) {
    const hour = Math.floor(minute / 60);
    const minuteLeft = minute % 60;
    return `${hour}h ${minuteLeft}m`;
  }

  return (
    <>
      <div className="middleize both-pad">
        <div className="flight-reservation-page paper">
          <h1>Your Booking Details</h1>
          <div style={{ width: "100%", marginTop: "10px" }} className="paper">
            {data && data.flight && Array.isArray(data.flight) ? (
              <>
                <div className="flight-reservation-detail">
                  <div className="flight-reservation-detail-upper-card">
                    <div className="dfc g-10">
                      <img
                        src={data.segmentRange.OriginSegment.Airline.Logo}
                        alt=""
                      />
                      <h2>{data.segmentRange.OriginSegment.Airline.Name}</h2>

                      <select
                        onChange={handleClassOptionChange}
                        className="select-class"
                        name=""
                        id=""
                      >
                        <option value="Economy">Economy Class</option>
                        <option value="Business">Business Class</option>
                        <option value="First">First Class</option>
                      </select>
                    </div>

                    <div className="dfc g-15">
                      <div className="f-data-component">
                        <p>
                          {new Date(
                            data.segmentRange.OriginSegment.FlightDepartureDate
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            // hourCycle:'h23',
                            // hour12: false,
                          })}
                        </p>
                        <strong>
                          {data.segmentRange.OriginSegment.OriginAirport.Code}
                        </strong>
                      </div>

                      <div className="f-data-component-m">
                        <p>{data.additionalData.totalDuration}m</p>
                        <span className="material-symbols-outlined">
                          trending_flat
                        </span>
                        <p>{data.additionalData.transits} Transit</p>
                      </div>

                      <div className="f-data-component">
                        <p>
                          {new Date(
                            data.segmentRange.DestinationSegment.FlightArrivalDate
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            // hourCycle:'h23',
                            // hour12: false,
                          })}
                        </p>
                        <strong>
                          {
                            data.segmentRange.DestinationSegment
                              .DestinationAirport.Code
                          }
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              data &&
              data.flight && (
                <>
                  <div className="flight-reservation-detail">
                    <div className="flight-reservation-detail-upper-card">
                      <div className="dfc g-10">
                        <img src={data.flight.Airline.Logo} alt="" />
                        <h2>{data.flight.Airline.Name}</h2>
                        <select
                          value={flightClass}
                          onChange={handleClassOptionChange}
                          className="select-class"
                          name=""
                          id=""
                        >
                          <option value="Economy">Economy Class</option>
                          <option value="Business">Business Class</option>
                          <option value="First">First Class</option>
                        </select>
                      </div>

                      <div className="dfc g-15">
                        <div className="f-data-component">
                          <p>
                            {new Date(
                              data.flight.FlightDepartureDate
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              // hourCycle:'h23',
                              // hour12: false,
                            })}
                          </p>
                          <strong>{data.flight.OriginAirport.Code}</strong>
                        </div>

                        <div className="f-data-component-m">
                          <p>{data.flight.FlightDuration}m</p>
                          <span className="material-symbols-outlined">
                            trending_flat
                          </span>
                          <p>Direct</p>
                        </div>

                        <div className="f-data-component">
                          <p>
                            {new Date(
                              data.flight.FlightArrivalDate
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              // hourCycle:'h23',
                              // hour12: false,
                            })}
                          </p>
                          <strong>{data.flight.DestinationAirport.Code}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )
            )}
          </div>

          <div className="flight-journey-detail">
            {data && data.flight && Array.isArray(data.flight) ? (
              <>
                {data.flight.map((flight: any, index: number) => {
                  return (
                    <React.Fragment key={index}>
                      <div className="place-journey">
                        <div className="origin-journey">
                          <h3>
                            {convertDateToTime(flight.FlightDepartureDate)}
                          </h3>
                          <p>
                            {convertDateToSimpleDate(
                              flight.FlightDepartureDate
                            )}
                          </p>
                        </div>
                        <div className="starting-line">
                          <div className="starting-line-circle" />
                          <div className="journey-line" />
                        </div>
                        <div className="origin-journey-details">
                          <h2>{flight.OriginAirport.Code}</h2>
                          <p>{flight.OriginAirport.Name}</p>
                        </div>
                      </div>

                      <div className="detail-journey">
                        <div className="duration-journey">
                          <p>
                            {convertMinuteToHourAndMinute(
                              flight.FlightDuration
                            )}
                          </p>
                        </div>

                        <div className="starting-line">
                          <div className="starting-line-circle" />
                          <div className="journey-line" />
                        </div>

                        <div className="detail-data-journey">
                          <div className="logo-and-airline-name">
                            <p>{flight.Airline.Name}</p>
                            <img src={flight.Airline.Logo} alt="" />
                          </div>
                          <div>
                            <p>{flight.Airplane.AirplaneCode}</p>
                          </div>
                          <div className="baggage-details">
                            <div
                              style={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "flex-start",
                                  flexDirection: "column",
                                }}
                              >
                                <span className="material-symbols-outlined">
                                  work
                                </span>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "2px",
                                }}
                              >
                                <p>
                                  Baggage {data.schedule.BaggageMaxWeight}kg
                                </p>
                                <p>Cabin {data.schedule.CabinMaxWeight}kg</p>
                              </div>
                            </div>
                          </div>
                          <div className="seat-detail">
                            <p>
                              Seat :{" "}
                              {selectedSeats[flight.ID]
                                ? selectedSeats[flight.ID]
                                : "None"}
                            </p>
                            <Modalv3
                              children={
                                <>
                                  <SeatSelector
                                    flightId={flight.ID}
                                    airplane={flight.Airplane}
                                    airline={flight.Airline}
                                    flight={flight}
                                    selectedFlightClass={flightClass}
                                    currentlySelectedSeat={
                                      selectedSeats[flight.ID]
                                    }
                                    onSeatSelected={handleSeatSelection}
                                  />
                                </>
                              }
                              div={
                                <div className="button">
                                  <p>Choose Seat</p>
                                </div>
                              }
                            ></Modalv3>
                          </div>
                          <div>
                            <p>Class : {flightClass}</p>
                          </div>
                        </div>
                      </div>

                      {index !== data.additionalData.restTimes.length - 1 && (
                        <div className="place-journey">
                          <div className="rest-journey">
                            <p>
                              {convertMinuteToHourAndMinute(
                                data.additionalData.restTimes[index]
                              )}
                            </p>
                          </div>
                          <div className="starting-line">
                            <div className="journey-line-d" />
                          </div>
                          <div className="rest-journey-details">
                            <p>Rest Time</p>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
                <div className="place-journey">
                  <div className="origin-journey">
                    <h3>
                      {convertDateToTime(
                        data.segmentRange.DestinationSegment.FlightArrivalDate
                      )}
                    </h3>
                    <p>
                      {convertDateToSimpleDate(
                        data.segmentRange.DestinationSegment.FlightArrivalDate
                      )}
                    </p>
                  </div>
                  <div className="starting-line">
                    <div className="starting-line-circle-done" />
                    {/* <div className="journey-line" /> */}
                  </div>
                  <div className="origin-journey-details">
                    <h2>
                      {
                        data.segmentRange.DestinationSegment.DestinationAirport
                          .Code
                      }
                    </h2>
                    <p>
                      {
                        data.segmentRange.DestinationSegment.DestinationAirport
                          .Name
                      }
                    </p>
                  </div>
                </div>
              </>
            ) : (
              data &&
              data.flight && (
                <>
                  <div className="place-journey">
                    <div className="origin-journey">
                      <h3>
                        {convertDateToTime(data.flight.FlightDepartureDate)}
                      </h3>
                      <p>
                        {convertDateToSimpleDate(
                          data.flight.FlightDepartureDate
                        )}
                      </p>
                    </div>
                    <div className="starting-line">
                      <div className="starting-line-circle" />
                      <div className="journey-line" />
                    </div>
                    <div className="origin-journey-details">
                      <h2>{data.flight.OriginAirport.Code}</h2>
                      <p>{data.flight.OriginAirport.Name}</p>
                    </div>
                  </div>

                  <div className="detail-journey">
                    <div className="duration-journey">
                      <p>
                        {convertMinuteToHourAndMinute(
                          data.flight.FlightDuration
                        )}
                      </p>
                    </div>

                    <div className="starting-line">
                      <div className="starting-line-circle" />
                      <div className="journey-line" />
                    </div>

                    <div className="detail-data-journey">
                      <div className="logo-and-airline-name">
                        <p>{data.flight.Airline.Name}</p>
                        <img src={data.flight.Airline.Logo} alt="" />
                      </div>
                      <div>
                        <p>{data.flight.Airplane.AirplaneCode}</p>
                      </div>
                      <div className="baggage-details">
                        <div
                          style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              display: "flex",
                              alignItems: "flex-start",
                              flexDirection: "column",
                            }}
                          >
                            <span className="material-symbols-outlined">
                              work
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "2px",
                            }}
                          >
                            <p>Baggage {data.schedule.BaggageMaxWeight}kg</p>
                            <p>Cabin {data.schedule.CabinMaxWeight}kg</p>
                          </div>
                        </div>
                      </div>
                      <div className="seat-detail">
                        <p>
                          Seat :{" "}
                          {selectedSeats[data.flight.ID]
                            ? selectedSeats[data.flight.ID]
                            : "None"}
                        </p>
                        <Modalv3
                          children={
                            <SeatSelector
                              flightId={data.flight.ID}
                              airplane={data.flight.Airplane}
                              airline={data.flight.Airline}
                              flight={data.flight}
                              selectedFlightClass={flightClass}
                              currentlySelectedSeat={
                                selectedSeats[data.flight.ID]
                              }
                              onSeatSelected={handleSeatSelection}
                            ></SeatSelector>
                          }
                          div={
                            <div className="button">
                              <p>Choose Seat</p>
                            </div>
                          }
                        ></Modalv3>
                      </div>
                      <div>
                        <p>Class : {flightClass}</p>
                      </div>
                    </div>
                  </div>

                  <div className="place-journey">
                    <div className="origin-journey">
                      <h3>
                        {convertDateToTime(data.flight.FlightArrivalDate)}
                      </h3>
                      <p>
                        {convertDateToSimpleDate(data.flight.FlightArrivalDate)}
                      </p>
                    </div>
                    <div className="starting-line">
                      <div className="starting-line-circle-done" />
                      {/* <div className="journey-line" /> */}
                    </div>
                    <div className="origin-journey-details">
                      <h2>{data.flight.DestinationAirport.Code}</h2>
                      <p>{data.flight.DestinationAirport.Name}</p>
                    </div>
                  </div>
                </>
              )
            )}
          </div>

          <div className="flight-reservation-payment-detail">
            <div
              style={{
                margin: "10px 0px",
                width: "auto",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  // margin:'10px 0',
                }}
              >
                <Modalv3
                  children={
                    <>
                      <div style={{ padding: "20px" }}>
                        <h2>Add On Baggage</h2>
                        <AddOnBaggage
                          onselected={handleBaggageSelected}
                          onclosemodal={handleCloseBaggageModal}
                        ></AddOnBaggage>
                      </div>
                    </>
                  }
                  div={
                    <div
                      className="hover-animation paper"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "7px",
                        borderRadius: "10px",
                        boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.088)",
                        gap: "3px",
                        userSelect: "none",
                        cursor: "pointer",
                      }}
                    >
                      <span className="material-symbols-outlined">luggage</span>
                      Add on Baggage
                      {addOnBaggage && <h3>(+{addOnBaggage} kg)</h3>}
                    </div>
                  }
                ></Modalv3>
                <h2></h2>
              </div>
            </div>

            <div>
              <div className="price-total-resv">
                <h2>Total Price</h2>
                <h1>
                  {data && data.additionalData
                    ? toString(
                        data.additionalData.totalPrice +
                          (addOnBaggagePrice ? addOnBaggagePrice : 0)
                      )
                    : data.flight &&
                      toString(
                        data.flight.BasePrice +
                          (addOnBaggagePrice ? addOnBaggagePrice : 0)
                      )}
                  {/* {
                    data && data.additionalData == undefined &&
                   toString( data.flight.BasePrice + (addOnBaggagePrice ? addOnBaggagePrice : 0))
                  } */}
                </h1>
                <h3>{addOnBaggagePrice && <>*add on baggage included</>}</h3>
                <div
                  style={{
                    width: "95%",
                    display: "flex",
                    gap: "10px",
                    justifyContent: "end",
                  }}
                >
                  <Button text="Buy Now" type={ButtonType.PRIMARY}></Button>
                  {/* <Modalv3 >

                  </Modalv3> */}
                  <Button
                    type={ButtonType.FOURTH}
                    children={
                      <>
                        <Modalv2
                          div={<>Add To Cart</>}
                          toggleModal={toggleCartModal}
                          modal={cartModalOpened}
                          children={
                            <>
                            <div className="modal-flight-res">
                              <h2>Successfully added to cart</h2>
                              <Button
                                children={
                                  <>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "12px",
                                      }}
                                    >
                                      Go to Cart Page{" "}
                                      <span className="material-symbols-outlined">
                                        shopping_cart
                                      </span>
                                    </div>
                                  </>
                                }
                                type={ButtonType.FOURTH}
                                onClick={() => navigate("/cart")}
                              ></Button>
                            </div>
                            </>
                          }
                        />
                      </>
                    }
                  ></Button>
                </div>
                <h2 style={{ color: "red" }}>{reservationError}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
