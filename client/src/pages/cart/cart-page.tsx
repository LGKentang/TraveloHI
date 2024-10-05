import React, { useEffect, useState } from "react";
import "../../styles/main/main.scss";
import "../../styles/parts/cart/CartPage.scss";
import useUser from "../../context/user-provider";
import { useCurrency } from "../../context/currency-provider";
import Button, { ButtonType } from "../../components/button";
import SeatSelector from "../flight/seat/seat-selector";
import Modalv3 from "../../components/modalv3";
import CheckInOut from "../../components/hotel/check-in-out";
import Modalv2 from "../../components/modalv2";
import { useNavigate } from "react-router-dom";
import CreditCard from "../../components/reusables/credit-card";
import Timer from "../../components/timer";

export default function CartPage() {
  const { user, getUser } = useUser();
  const [userData, setUserData] = useState<any>(null);
  const [carts, setCarts] = useState<any>(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const { toString, selectedCurrencySymbol } = useCurrency();
  const [flightDatas, setFlightDatas] = useState<any[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<any>({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [promos, setPromos] = useState<any>(null);
  const [selectedPromos, setSelectedPromos] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [cards, setCards] = useState<any>(null);

  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [errorText, setErrorText] = useState<any>("");

  const [modalOpened, setModalOpened] = useState(false);

  const toggleModal = async() => {
    if (!user) {
      navigate("/login");
    }
    if (user && !modalOpened) {
      if (cartValidation() !== null) {
        setErrorText(cartValidation());
        return;
      }

      setErrorText("");
      const data : any = await handleCartPayment();
      console.log(data)
      if (data != null){
        if (data.error != undefined){
          setErrorText(data.error)
        }
        else{
          setModalOpened(true);
        }
      }

    }
  };

  const handleCartPayment = async () => {
    if (user) {
      const response = await fetch(
        `http://localhost:3000/api/cart/checkout/${user.Id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            promo: selectedPromos === null ? null : selectedPromos.ID,
            payment_method: selectedPaymentMethod,
            card: selectedCard === null ? null : selectedCard.ID,
          }),
        }
      );
      const data = await response.json();
      console.log(data);
      return data
    }
    return null;
  };

  const cartValidation = () => {
    if (selectedPaymentMethod === null) {
      return "Please select a payment method";
    }
    if (
      selectedPaymentMethod === "wallet" &&
      totalPrice >= userData.WalletBalance
    ) {
      return "Your wallet balance is insufficient";
    }
    if (selectedPaymentMethod === "credit" && selectedCard === null) {
      return "Please select a credit card or add one through the home page";
    }
    return null;
  };

  const navigate = useNavigate();
  const getPromoObject = (index: number) => {
    if (promos) {
      for (const promo of promos) {
        if (promo.ID === index) {
          return promo;
        }
      }
      return null;
    }
  };

  const handleClearCart = async () => {
    if (user) {
      const response = await fetch(
        `http://localhost:3000/api/cart/delete/all/${user.Id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log(data);

      fetchData();
    }
  };

  // console.log(flightDatas);
  const fetchData = async () => {
    if (user) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/cart/${user.Id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        const data = await response.json();
        setCarts(data);

        for (const d of data) {
          console.log(new Date(d.Cart.ExpiredAt));
        }

        console.log(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } else {
      navigate("/login");
    }
  };

  const fetchUser = async () => {
    if (user?.Email) {
      const data = await getUser(user.Email);
      setUserData(data);
      console.log(data);
    }
  };

  const fetchCardData = async () => {
    // console.log(user)
    if (user) {
      const response = await fetch(`http://localhost:3000/api/card/${user.Id}`);
      const data = await response.json();

      console.log(data);
      setCards(data);
    }
  };

  const fetchPromos = async () => {
    const response = await fetch("http://localhost:3000/api/promo/all", {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    console.log(data);
    setPromos(data);
  };

  console.log(carts);
  useEffect(() => {
    if (user && carts === null) {
      fetchData();
      fetchUser();
      fetchPromos();
      fetchCardData();
    }
    // else{
    //   navigate('/login');
    // }
  }, [user, carts]);

  const fetchFlightDetails = async (id: any) => {
    const response = await fetch(
      `http://localhost:3000/api/flight/schedule/${id}`
    );
    const data = await response.json();
    console.log(data);
    setFlightDatas((prevFlightDatas) => [...prevFlightDatas, data]);
    // data.map((d : any) => {
    //   if (d.additionalData === undefined){
    //     totalPrice += d.schedule.BasePrice;
    //   }
    // })
  };

  useEffect(() => {
    if (carts) {
      console.log(carts);
      let totalPrice = 0;

      carts.map((cart: any) => {
        if (!cart.Expired && !cart.Cart.Paid) {
          console.log(cart.Cart.Paid);
          if (cart.Cart.FlightReservationId === null) {
            totalPrice += cart.Cart.HotelReservation.TotalPrice;
          } else {
            console.log(cart.Cart.FlightReservationId);
            if (cart.FlightData.additionalData === undefined) {
              totalPrice += cart.FlightData.schedule.BasePrice;
            } else {
              totalPrice += cart.FlightData.additionalData.totalPrice;
            }
          }
        }
      });

      setTotalPrice(totalPrice);
    }

    // if (flightDatas.length > 0) {
    //   let totalPrice = 0;
    //   flightDatas.map((d: any) => {
    //     if (d.additionalData === undefined) {
    //       totalPrice += d.schedule.BasePrice;
    //     } else {
    //       totalPrice += d.additionalData.totalPrice;
    //     }
    //   });

    //   carts.map((cartItem: any) => {
    //     if (cartItem.HotelReservationId !== null) {
    //       totalPrice += cartItem.HotelReservation.TotalPrice;
    //     }
    //   });

    // }
  }, [flightDatas, carts]);

  // console.log(promos[0])

  const fetchRoomType = async (roomId: number) => {
    const response = await fetch(
      `http://localhost:3000/api/room/type/${roomId}`
    );
    const data = await response.json();

    return data;
  };
  function convertDateToTime(date: any) {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      // hourCycle:'h23',
      // hour12: false,
    });
  }
  const handleSeatSelection = (flightId: any, seat: any) => {
    setSelectedSeats((prevSelectedSeats: any) => ({
      ...prevSelectedSeats,
      [flightId]: seat,
    }));
  };

  const isExpired = (cart: any) => {
    if (cart.Expired) return "grayscale-div cannot-click";
  };

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

  function toggleRadioButton(radioButton: any) {
    if (radioButton instanceof HTMLInputElement) {
      if (!radioButton.checked) {
        console.log("Checking");
        radioButton.checked = true; // Check the radio button
        console.log("New state:", radioButton.checked);
      } else {
        console.log("Unchecking");
        radioButton.checked = false; // Uncheck the radio button
        console.log("New state:", radioButton.checked);
      }
    }
  }

  function cartCheck(cartIsPaid: boolean, object: any) {
    if (cartIsPaid) return <></>;
    else return object;
  }

  return (
    <>
      <div className="middleize nav-pad">
        <div className="cart-page accordion paper">
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <h1 style={{ marginBottom: "10px" }}>My Cart</h1>
            <Button
              type={ButtonType.SEVENTH}
              children={
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span className="material-symbols-outlined">
                    delete_forever
                  </span>
                  Clear Cart
                </div>
              }
              onClick={() => {
                handleClearCart();
              }}
            ></Button>
          </div>
          <ul className="accordion">
            {carts &&
              carts.map((cartItem: any, index: number) => {
                if (cartItem.Cart.FlightReservationId !== null) {
                  return (
                    <div key={index}>
                      {cartItem.FlightData &&
                      cartItem.FlightData.additionalData &&
                      cartItem.FlightData.additionalData !== null
                        ? cartCheck(
                            cartItem.Cart && cartItem.Cart.Paid,
                            <li>
                              <>
                                <div
                                  style={{
                                    display: "flex",
                                    width: "100%",
                                    justifyContent: "end",
                                  }}
                                >
                                  {cartItem && cartItem.Expired == false && (
                                    <Timer
                                      duration={new Date(
                                        cartItem.Cart.ExpiredAt
                                      ).getTime()}
                                    ></Timer>
                                  )}
                                </div>
                                <div
                                  className={
                                    "flight-reservation-detail-c " +
                                    isExpired(cartItem)
                                  }
                                >
                                  {cartItem.Cart && cartItem.Cart.Paid
                                    ? "true"
                                    : "false"}
                                  <div className="flight-reservation-detail-upper-card">
                                    <div className="dfc g-10">
                                      <img
                                        src={
                                          cartItem.FlightData.segmentRange
                                            .OriginSegment.Airline.Logo
                                        }
                                        alt=""
                                      />
                                      <h2>
                                        {
                                          cartItem.FlightData.segmentRange
                                            .OriginSegment.Airline.Name
                                        }
                                      </h2>

                                      {/* <span className="material-symbols-outlined">
      chevron_right
    </span> */}
                                    </div>

                                    <div
                                      className={
                                        "dfc g-15"
                                        // + isExpired(cartItem)
                                      }
                                    >
                                      <div className="f-data-component">
                                        <p>
                                          {new Date(
                                            cartItem.FlightData.segmentRange.OriginSegment.FlightDepartureDate
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            // hourCycle:'h23',
                                            // hour12: false,
                                          })}
                                        </p>
                                        <strong>
                                          {
                                            cartItem.FlightData.segmentRange
                                              .OriginSegment.OriginAirport.Code
                                          }
                                        </strong>
                                      </div>

                                      <div className="f-data-component-m">
                                        <p>
                                          {
                                            cartItem.FlightData.additionalData
                                              .totalDuration
                                          }
                                          m
                                        </p>
                                        <span className="material-symbols-outlined">
                                          trending_flat
                                        </span>
                                        <p>
                                          {
                                            cartItem.FlightData.additionalData
                                              .transits
                                          }{" "}
                                          Transit
                                        </p>
                                      </div>

                                      <div className="f-data-component">
                                        <p>
                                          {new Date(
                                            cartItem.FlightData.segmentRange.DestinationSegment.FlightArrivalDate
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            // hourCycle:'h23',
                                            // hour12: false,
                                          })}
                                        </p>
                                        <strong>
                                          {
                                            cartItem.FlightData.segmentRange
                                              .DestinationSegment
                                              .DestinationAirport.Code
                                          }
                                        </strong>
                                      </div>

                                      <h2>
                                        {toString(
                                          cartItem.FlightData.additionalData
                                            .totalPrice
                                        )}
                                      </h2>

                                      {cartItem.Expired ? "[Expired]" : ""}
                                    </div>
                                  </div>
                                </div>

                                <input
                                  type="radio"
                                  name="accordion"
                                  id={toString(index)}
                                  disabled={cartItem.Expired}
                                  // onClick={(event) => toggleRadioButton(event.target)}
                                />
                                <label htmlFor={toString(index)}>
                                  <span className="material-symbols-outlined">
                                    chevron_right
                                  </span>
                                </label>

                                <div className="content">
                                  <div className="flight-journey-detail">
                                    {cartItem.FlightData &&
                                    cartItem.FlightData.flight &&
                                    Array.isArray(
                                      cartItem.FlightData.flight
                                    ) ? (
                                      <>
                                        {cartItem.FlightData.flight.map(
                                          (flight: any, index: number) => {
                                            return (
                                              <React.Fragment key={index}>
                                                <div className="place-journey">
                                                  <div className="origin-journey">
                                                    <h3>
                                                      {convertDateToTime(
                                                        flight.FlightDepartureDate
                                                      )}
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
                                                    <h2>
                                                      {
                                                        flight.OriginAirport
                                                          .Code
                                                      }
                                                    </h2>
                                                    <p>
                                                      {
                                                        flight.OriginAirport
                                                          .Name
                                                      }
                                                    </p>
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
                                                      <p>
                                                        {flight.Airline.Name}
                                                      </p>
                                                      <img
                                                        src={
                                                          flight.Airline.Logo
                                                        }
                                                        alt=""
                                                      />
                                                    </div>
                                                    <div>
                                                      <p>
                                                        {
                                                          flight.Airplane
                                                            .AirplaneCode
                                                        }
                                                      </p>
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
                                                            alignItems:
                                                              "flex-start",
                                                            flexDirection:
                                                              "column",
                                                          }}
                                                        >
                                                          <span className="material-symbols-outlined">
                                                            work
                                                          </span>
                                                        </div>
                                                        <div
                                                          style={{
                                                            display: "flex",
                                                            flexDirection:
                                                              "column",
                                                            gap: "2px",
                                                          }}
                                                        >
                                                          <p>
                                                            Baggage{" "}
                                                            {
                                                              cartItem
                                                                .FlightData
                                                                .schedule
                                                                .BaggageMaxWeight
                                                            }
                                                            kg
                                                          </p>
                                                          <p>
                                                            Cabin{" "}
                                                            {
                                                              cartItem
                                                                .FlightData
                                                                .schedule
                                                                .CabinMaxWeight
                                                            }
                                                            kg
                                                          </p>
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div className="seat-detail">
                                                      <p>
                                                        Seat :{" "}
                                                        {selectedSeats[
                                                          flight.ID
                                                        ]
                                                          ? selectedSeats[
                                                              flight.ID
                                                            ]
                                                          : "None"}
                                                      </p>
                                                    </div>
                                                    <div>
                                                      {/* <p>Class : {flightClass}</p> */}
                                                    </div>
                                                  </div>
                                                </div>

                                                {index !==
                                                  cartItem.FlightData
                                                    .additionalData.restTimes
                                                    .length -
                                                    1 && (
                                                  <div className="place-journey">
                                                    <div className="rest-journey">
                                                      <p>
                                                        {convertMinuteToHourAndMinute(
                                                          cartItem.FlightData
                                                            .additionalData
                                                            .restTimes[index]
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
                                          }
                                        )}
                                        <div className="place-journey">
                                          <div className="origin-journey">
                                            <h3>
                                              {convertDateToTime(
                                                cartItem.FlightData.segmentRange
                                                  .DestinationSegment
                                                  .FlightArrivalDate
                                              )}
                                            </h3>
                                            <p>
                                              {convertDateToSimpleDate(
                                                cartItem.FlightData.segmentRange
                                                  .DestinationSegment
                                                  .FlightArrivalDate
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
                                                cartItem.FlightData.segmentRange
                                                  .DestinationSegment
                                                  .DestinationAirport.Code
                                              }
                                            </h2>
                                            <p>
                                              {
                                                cartItem.FlightData.segmentRange
                                                  .DestinationSegment
                                                  .DestinationAirport.Name
                                              }
                                            </p>
                                          </div>
                                        </div>
                                      </>
                                    ) : (
                                      cartItem.FlightData &&
                                      cartItem.FlightData.flight && (
                                        <>
                                          <div className="place-journey">
                                            <div className="origin-journey">
                                              <h3>
                                                {convertDateToTime(
                                                  cartItem.FlightData.flight
                                                    .FlightDepartureDate
                                                )}
                                              </h3>
                                              <p>
                                                {convertDateToSimpleDate(
                                                  cartItem.FlightData.flight
                                                    .FlightDepartureDate
                                                )}
                                              </p>
                                            </div>
                                            <div className="starting-line">
                                              <div className="starting-line-circle" />
                                              <div className="journey-line" />
                                            </div>
                                            <div className="origin-journey-details">
                                              <h2>
                                                {
                                                  cartItem.FlightData.flight
                                                    .OriginAirport.Code
                                                }
                                              </h2>
                                              <p>
                                                {
                                                  cartItem.FlightData.flight
                                                    .OriginAirport.Name
                                                }
                                              </p>
                                            </div>
                                          </div>

                                          <div className="detail-journey">
                                            <div className="duration-journey">
                                              <p>
                                                {convertMinuteToHourAndMinute(
                                                  cartItem.FlightData.flight
                                                    .FlightDuration
                                                )}
                                              </p>
                                            </div>

                                            <div className="starting-line">
                                              <div className="starting-line-circle" />
                                              <div className="journey-line" />
                                            </div>

                                            <div className="detail-data-journey">
                                              <div className="logo-and-airline-name">
                                                <p>
                                                  {
                                                    cartItem.FlightData.flight
                                                      .Airline.Name
                                                  }
                                                </p>
                                                <img
                                                  src={
                                                    cartItem.FlightData.flight
                                                      .Airline.Logo
                                                  }
                                                  alt=""
                                                />
                                              </div>
                                              <div>
                                                <p>
                                                  {
                                                    cartItem.FlightData.flight
                                                      .Airplane.AirplaneCode
                                                  }
                                                </p>
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
                                                      Baggage{" "}
                                                      {
                                                        cartItem.FlightData
                                                          .schedule
                                                          .BaggageMaxWeight
                                                      }
                                                      kg
                                                    </p>
                                                    <p>
                                                      Cabin{" "}
                                                      {
                                                        cartItem.FlightData
                                                          .schedule
                                                          .CabinMaxWeight
                                                      }
                                                      kg
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="seat-detail">
                                                <p>
                                                  Seat :{" "}
                                                  {selectedSeats[
                                                    cartItem.FlightData.flight
                                                      .ID
                                                  ]
                                                    ? selectedSeats[
                                                        cartItem.FlightData
                                                          .flight.ID
                                                      ]
                                                    : "None"}
                                                </p>
                                                <Modalv3
                                                  children={
                                                    <SeatSelector
                                                      flightId={
                                                        cartItem.FlightData
                                                          .flight.ID
                                                      }
                                                      airplane={
                                                        cartItem.FlightData
                                                          .flight.Airplane
                                                      }
                                                      airline={
                                                        cartItem.FlightData
                                                          .flight.Airline
                                                      }
                                                      flight={
                                                        cartItem.FlightData
                                                          .flight
                                                      }
                                                      // selectedFlightClass={flightClass}
                                                      currentlySelectedSeat={
                                                        selectedSeats[
                                                          cartItem.FlightData
                                                            .flight.ID
                                                        ]
                                                      }
                                                      onSeatSelected={
                                                        handleSeatSelection
                                                      }
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
                                                {/* <p>Class : {flightClass}</p> */}
                                              </div>
                                            </div>
                                          </div>

                                          <div className="place-journey">
                                            <div className="origin-journey">
                                              <h3>
                                                {convertDateToTime(
                                                  cartItem.FlightData.flight
                                                    .FlightArrivalDate
                                                )}
                                              </h3>
                                              <p>
                                                {convertDateToSimpleDate(
                                                  cartItem.FlightData.flight
                                                    .FlightArrivalDate
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
                                                  cartItem.FlightData.flight
                                                    .DestinationAirport.Code
                                                }
                                              </h2>
                                              <p>
                                                {
                                                  cartItem.FlightData.flight
                                                    .DestinationAirport.Name
                                                }
                                              </p>
                                            </div>
                                          </div>
                                        </>
                                      )
                                    )}
                                  </div>

                                  <div className="">
                                    {/* <Button
    text="Save Changes"
    type={ButtonType.PRIMARY}
  /> */}
                                  </div>
                                </div>
                              </>
                            </li>
                          )
                        : cartItem.FlightData && 
                            cartCheck(cartItem.Cart && cartItem.Cart.Paid, <>
                              <div
                                style={{
                                  display: "flex",
                                  width: "100%",
                                  justifyContent: "end",
                                }}
                              >
                                {cartItem && cartItem.Expired == false && (
                                  <Timer
                                    duration={new Date(
                                      cartItem.Cart.ExpiredAt
                                    ).getTime()}
                                  ></Timer>
                                )}
                              </div>
                              <div
                                className={
                                  "flight-reservation-detail-c " +
                                  isExpired(cartItem)
                                }
                              >
                                <div className="flight-reservation-detail-upper-card">
                                  <div className="dfc g-10">
                                    <img
                                      src={
                                        cartItem.FlightData.flight.Airline.Logo
                                      }
                                      alt=""
                                    />
                                    <h2>
                                      {cartItem.FlightData.flight.Airline.Name}
                                    </h2>
                                  </div>

                                  <div className={"dfc g-15 "}>
                                    <div className="f-data-component">
                                      <p>
                                        {new Date(
                                          cartItem.FlightData.flight.FlightDepartureDate
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          // hourCycle:'h23',
                                          // hour12: false,
                                        })}
                                      </p>
                                      <strong>
                                        {
                                          cartItem.FlightData.flight
                                            .OriginAirport.Code
                                        }
                                      </strong>
                                    </div>

                                    <div className="f-data-component-m">
                                      <p>
                                        {
                                          cartItem.FlightData.flight
                                            .FlightDuration
                                        }
                                        m
                                      </p>
                                      <span className="material-symbols-outlined">
                                        trending_flat
                                      </span>
                                      <p>Direct</p>
                                    </div>

                                    <div className="f-data-component">
                                      <p>
                                        {new Date(
                                          cartItem.FlightData.flight.FlightArrivalDate
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          // hourCycle:'h23',
                                          // hour12: false,
                                        })}
                                      </p>
                                      <strong>
                                        {
                                          cartItem.FlightData.flight
                                            .DestinationAirport.Code
                                        }
                                      </strong>
                                    </div>
                                    <h2>
                                      {toString(
                                        cartItem.FlightData.flight.BasePrice
                                      )}
                                    </h2>
                                    {cartItem.Expired ? "[Expired]" : ""}
                                  </div>
                                </div>
                              </div>

                              <input
                                type="radio"
                                name="accordion"
                                id={toString(index)}
                                disabled={cartItem.Expired}
                                // onClick={(event) => toggleRadioButton(event.target)}
                              />
                              <label htmlFor={toString(index)}>
                                <span className="material-symbols-outlined">
                                  chevron_right
                                </span>
                              </label>

                              <div className="content">
                                <>
                                  <div className="place-journey">
                                    <div className="origin-journey">
                                      <h3>
                                        {convertDateToTime(
                                          cartItem.FlightData.flight
                                            .FlightDepartureDate
                                        )}
                                      </h3>
                                      <p>
                                        {convertDateToSimpleDate(
                                          cartItem.FlightData.flight
                                            .FlightDepartureDate
                                        )}
                                      </p>
                                    </div>
                                    <div className="starting-line">
                                      <div className="starting-line-circle" />
                                      <div className="journey-line" />
                                    </div>
                                    <div className="origin-journey-details">
                                      <h2>
                                        {
                                          cartItem.FlightData.flight
                                            .OriginAirport.Code
                                        }
                                      </h2>
                                      <p>
                                        {
                                          cartItem.FlightData.flight
                                            .OriginAirport.Name
                                        }
                                      </p>
                                    </div>
                                  </div>

                                  <div className="detail-journey">
                                    <div className="duration-journey">
                                      <p>
                                        {convertMinuteToHourAndMinute(
                                          cartItem.FlightData.flight
                                            .FlightDuration
                                        )}
                                      </p>
                                    </div>

                                    <div className="starting-line">
                                      <div className="starting-line-circle" />
                                      <div className="journey-line" />
                                    </div>

                                    <div className="detail-data-journey">
                                      <div className="logo-and-airline-name">
                                        <p>
                                          {
                                            cartItem.FlightData.flight.Airline
                                              .Name
                                          }
                                        </p>
                                        <img
                                          src={
                                            cartItem.FlightData.flight.Airline
                                              .Logo
                                          }
                                          alt=""
                                        />
                                      </div>
                                      <div>
                                        <p>
                                          {
                                            cartItem.FlightData.flight.Airplane
                                              .AirplaneCode
                                          }
                                        </p>
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
                                              Baggage{" "}
                                              {
                                                cartItem.FlightData.schedule
                                                  .BaggageMaxWeight
                                              }
                                              kg
                                            </p>
                                            <p>
                                              Cabin{" "}
                                              {
                                                cartItem.FlightData.schedule
                                                  .CabinMaxWeight
                                              }
                                              kg
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="seat-detail">
                                        <p>
                                          Seat :{" "}
                                          {selectedSeats[
                                            cartItem.FlightData.flight.ID
                                          ]
                                            ? selectedSeats[
                                                cartItem.FlightData.flight.ID
                                              ]
                                            : "None"}
                                        </p>
                                      </div>
                                      <div>
                                        {/* <p>Class : {flightClass}</p> */}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="place-journey">
                                    <div className="origin-journey">
                                      <h3>
                                        {convertDateToTime(
                                          cartItem.FlightData.flight
                                            .FlightArrivalDate
                                        )}
                                      </h3>
                                      <p>
                                        {convertDateToSimpleDate(
                                          cartItem.FlightData.flight
                                            .FlightArrivalDate
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
                                          cartItem.FlightData.flight
                                            .DestinationAirport.Code
                                        }
                                      </h2>
                                      <p>
                                        {
                                          cartItem.FlightData.flight
                                            .DestinationAirport.Name
                                        }
                                      </p>
                                    </div>
                                  </div>
                                </>
                              </div>
                            </>)
                          }
                    </div>
                  );
                } else if (cartItem.Cart.HotelReservationId !== null) {
                  return cartCheck(cartItem.Cart && cartItem.Cart.Paid , <>
                    <div
                      style={{
                        display: "flex",
                        width: "100%",
                        justifyContent: "end",
                      }}
                    >
                      {cartItem && cartItem.Expired == false && (
                        <Timer
                          duration={new Date(
                            cartItem.Cart.ExpiredAt
                          ).getTime()}
                        ></Timer>
                      )}
                    </div>
                    <div
                      key={index}
                      className={
                        "hotel-reservation-cart-item " + isExpired(cartItem)
                      }
                      style={{ marginTop: "10px" }}
                    >
                      <div className="reservation-image-holder">
                        <img
                          src={
                            cartItem.Cart.HotelReservation.Hotel.MainImagePath
                          }
                          alt=""
                        />
                      </div>

                      <div className="reservation-details">
                        <div className="reservation-details-header">
                          <div>
                            <h2>
                              {cartItem.Cart.HotelReservation.Hotel.Name}
                            </h2>
                            <h4>
                              ({cartItem.Cart.HotelReservation.BookingDays}x){" "}
                              {cartItem.Cart.HotelReservation.Room.Type} (
                              {cartItem.Cart.HotelReservation.BookingDays}{" "}
                              Nights)
                            </h4>
                          </div>
                          {/* <div className="paper remove-cart-item-icon">
                          <span className="material-symbols-outlined">
                            delete
                          </span>
                        </div> */}
                        </div>
                        <div className="reservation-details-body">
                          <h2>
                            {toString(
                              cartItem.Cart.HotelReservation.TotalPrice
                            )}
                          </h2>
                          {cartItem.Expired ? "[Expired]" : ""}
                        </div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="accordion"
                      id={toString(index)}
                      disabled={cartItem.Expired}
                      // onClick={(event) => toggleRadioButton(event.target)}
                    />
                    <label htmlFor={toString(index)}>
                      <span className="material-symbols-outlined">
                        chevron_right
                      </span>
                    </label>
                    <div className="content">
                      <CheckInOut
                        hotel={cartItem.Cart}
                        onclick={() => {
                          fetchData();
                        }}
                      />
                    </div>
                  </>)
                    
                  ;
                }
              })}
          </ul>

          <div className="total-price-holder">
            <div className="total-price">
              <h2>Total Price</h2>
              <h1>{toString(totalPrice)}</h1>
            </div>
          </div>

          <Modalv3
            children={
              <>
                <div className="promo-pick-modal paper">
                  <h1>Promos</h1>
                  {promos &&
                    promos.map((promo: any) => {
                      return (
                        <>
                          <div
                            onClick={() => {
                              setSelectedPromos(promo);
                            }}
                            className={`promo-pick-item ${
                              selectedPromos && selectedPromos.ID === promo.ID
                                ? "clicked"
                                : ""
                            }`}
                          >
                            <img src={promo.ImagePath} alt="" />
                            <div className="promo-pick-content">
                              <h2>
                                {promo.Title === "Flight"
                                  ? "Flight Discount"
                                  : "Hotel Discount"}
                              </h2>
                              <h2>
                                {promo.Value === null
                                  ? promo.Percentage * 100 + "% Off"
                                  : toString(promo.Value)}
                              </h2>
                            </div>
                          </div>
                        </>
                      );
                    })}
                </div>
              </>
            }
            div={
              <div className="use-promo">
                <div style={{ display: "flex", gap: "10px" }}>
                  <span className="material-symbols-outlined">percent</span>
                  <h1>Use Promo</h1>
                </div>

                <div>
                  <h2>{selectedPromos && selectedPromos.Title}</h2>
                  <h2>
                    {selectedPromos &&
                      selectedPromos.Percentage &&
                      selectedPromos.Percentage * 100 + "% Off"}
                    {selectedPromos &&
                      selectedPromos.Value &&
                      toString(selectedPromos.Value)}
                  </h2>
                </div>

                {/* <h1 style={{ display: "flex", gap: "10px" }}>
                  <span>
                    {promos &&
                      selectedPromos &&
                      getPromoObject(selectedPromos).Title}
                  </span>
                  <span>
    {promos &&
    selectedPromos &&
    getPromoObject(selectedPromos).Value !== null
        ? toString(getPromoObject(selectedPromos).Value)
        : getPromoObject(selectedPromos).Percentage &&getPromoObject(selectedPromos).Percentage * 100 + "%"}
</span>

                </h1> */}
              </div>
            }
          ></Modalv3>

          <Modalv3
            children={
              <>
                <div className="payment-method-modal paper">
                  <h1>Payment</h1>
                  <div
                    onClick={() => {
                      setSelectedPaymentMethod("wallet");
                    }}
                    className={
                      "payment-method-item " +
                      (selectedPaymentMethod === "wallet" ? "clicked" : "")
                    }
                  >
                    <span className="material-symbols-outlined">
                      account_balance_wallet
                    </span>
                    <h2>HI-Wallet</h2>
                    <h2>{userData && toString(userData.WalletBalance)}</h2>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      padding: "0 10px",
                      color: "red",
                    }}
                  >
                    <h2>
                      {userData &&
                      totalPrice &&
                      selectedPaymentMethod === "wallet" &&
                      userData.WalletBalance < totalPrice
                        ? "Insufficient Wallet Balance"
                        : ""}
                    </h2>
                  </div>

                  <div
                    onClick={() => {
                      setSelectedPaymentMethod("credit");
                    }}
                    className={
                      "payment-method-item " +
                      (selectedPaymentMethod === "credit" ? "clicked" : "")
                    }
                  >
                    <span className="material-symbols-outlined">
                      credit_card
                    </span>
                    <h2>Credit Card</h2>
                  </div>

                  <div className="whole-of-cards">
                    {selectedPaymentMethod &&
                      selectedPaymentMethod === "credit" && (
                        <>
                          {cards &&
                            cards.map((card: any) => {
                              return (
                                <>
                                  <div
                                    onClick={() => {
                                      setSelectedCard(card.ID);
                                    }}
                                    className={
                                      selectedCard === card.ID
                                        ? "credit-card-obj-t"
                                        : "credit-card-obj-u"
                                    }
                                  >
                                    <CreditCard
                                      digits={card.CreditCard.CardNumber}
                                      name={card.CreditCard.CardHolderName}
                                      expirationMonth={new Date(
                                        card.CreditCard.ExpirationDate
                                      ).getMonth()}
                                      expirationYear={
                                        new Date(
                                          card.CreditCard.ExpirationDate
                                        ).getUTCFullYear() - 2000
                                      }
                                    ></CreditCard>
                                  </div>
                                </>
                              );
                            })}
                        </>
                      )}
                  </div>
                </div>
              </>
            }
            div={
              <div className="use-promo">
                {/* <div style={{ display: "flex", gap: "10px" }}> */}
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <span className="material-symbols-outlined">payments</span>
                  <h1>Choose Payment Method</h1>
                </div>

                <h2>
                  {selectedPaymentMethod && selectedPaymentMethod === "credit"
                    ? "Credit Card"
                    : selectedPaymentMethod === "wallet"
                    ? "HI-Wallet"
                    : ""}
                </h2>
                {/* </div> */}
              </div>
            }
          />

          <h1 style={{ color: "red" }}>{errorText}</h1>
          <div className="total-price-holder">
            <Modalv2
              toggleModal={toggleModal}
              modal={modalOpened}
              children={
                <>
                  <div className="paper">
                    <h1>Successfully purchased cart items</h1>
                    <h2 style={{ marginBottom: "10px" }}>
                      You can check the tickets you bought at ticket page in
                      profile!
                    </h2>

                    <Button
                      text="Home"
                      type={ButtonType.FOURTH}
                      onClick={() => {
                        navigate("/home");
                      }}
                    ></Button>
                  </div>
                </>
              }
              div={
                <div className="button">
                  <h2
                    style={{
                      color: "white",
                      fontSize: "24px",
                      fontWeight: "bold",
                    }}
                  >
                    Buy Cart
                  </h2>
                </div>
              }
            ></Modalv2>
          </div>
        </div>
      </div>
    </>
  );
}
