import React from "react";
import { useCurrency } from "../context/currency-provider";
import Timer from "./timer";
import CheckInOut from "./hotel/check-in-out";
import "../styles/main/main.scss";
import "../styles/parts/cart/CartItems.scss";

const CartItems = ({carts} : any) => {

    function cartCheck(cartIsPaid: boolean, cartEnded : boolean, object: any) {
        if (cartIsPaid && cartEnded) return <></>;
        else return object;
    }

  

    const {toString} = useCurrency();

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
      function convertDateToTime(date: any) {
        return new Date(date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          // hourCycle:'h23',
          // hour12: false,
        });
      }
    return( <>
    <div className="cart-item accordion">

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
                            cartItem.Cart && cartItem.Cart.Paid, cartItem.Ended,
                            <li>
                              <>
                                <div
                                  style={{
                                    display: "flex",
                                    width: "100%",
                                    justifyContent: "end",
                                  }}
                                >
                                  {/* {cartItem && cartItem.Expired == false && (
                                    <Timer
                                      duration={new Date(
                                        cartItem.Cart.ExpiredAt
                                      ).getTime()}
                                    ></Timer>
                                  )} */}
                                </div>
                                <div
                                  className={
                                    "flight-reservation-detail-c "+
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

                                {/* <input
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
                                </label> */}

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
                                                    {/* <div className="seat-detail">
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
                                                    </div> */}
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
                                              {/* <div className="seat-detail">
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
                                              </div> */}
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
                            cartCheck(cartItem.Cart && cartItem.Cart.Paid, cartItem.Ended,<>
                              <div
                                style={{
                                  display: "flex",
                                  width: "100%",
                                  justifyContent: "end",
                                }}
                              >
                                {/* {cartItem && cartItem.Expired == false && (
                                  <Timer
                                    duration={new Date(
                                      cartItem.Cart.ExpiredAt
                                    ).getTime()}
                                  ></Timer>
                                )} */}
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

                              {/* <input
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
                              </label> */}

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
                                      {/* <div className="seat-detail">
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
                                      </div> */}
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
                  return cartCheck(cartItem.Cart && cartItem.Cart.Paid, cartItem.Ended, <>
                    <div
                      style={{
                        display: "flex",
                        width: "100%",
                        justifyContent: "end",
                      }}
                    >
                      {/* {cartItem && cartItem.Expired == false && (
                        <Timer
                          duration={new Date(
                            cartItem.Cart.ExpiredAt
                          ).getTime()}
                        ></Timer>
                      )} */}
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
                    {/* <input
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
                    </label> */}
                    {/* <div className="content">
                      <CheckInOut
                        hotel={cartItem.Cart}
                        onclick={() => {
                          fetchData();
                        }}
                      />
                    </div> */}
                  </>)
                    
                  ;
                }
              })}
          </ul>
    </div>
    </>)
}

export default CartItems