import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import "../../styles/parts/hotel/HotelBooking.scss";
import { useCurrency } from "../../context/currency-provider";
import DatePicker from "react-datepicker";
import Button, { ButtonType } from "../../components/button";
import Modal from "../../components/modal";
import useUser from "../../context/user-provider";
import Modalv2 from "../../components/modalv2";

export default function HotelBuyPage() {
  const { user } = useUser();
  const { roomId, hotelId } = useParams();
  const [hotelData, setHotelData] = useState<any>(null);
  const [roomData, setRoomData] = useState<any>(null);
  const { convertPrice, selectedCurrencySymbol, toString } = useCurrency();
  const [inDate, setInDate] = useState<string>("");
  const [outDate, setOutDate] = useState<string>("");
  const navigate = useNavigate();
  const isValidDate = (dateString: string): boolean =>
    !isNaN(new Date(dateString).getTime());
  const inDateObj = isValidDate(inDate) ? new Date(inDate) : null;
  const outDateObj = isValidDate(outDate) ? new Date(outDate) : null;
  const dateInterval =
    inDateObj && outDateObj ? outDateObj.getTime() - inDateObj.getTime() : null;
  const dateIntervalInDays = dateInterval
    ? dateInterval / (1000 * 60 * 60 * 24)
    : null;
  console.log(dateIntervalInDays);
  const [modalOpened, setModalOpened] = useState(false);

  const toggleModal = () => {
    if (!user) {
      navigate("/login");
    }
    if (user && !modalOpened) {
      handleBookingRequest();
      setModalOpened(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(hotelId);
        const response = await fetch(
          `http://localhost:3000/api/hotel/get/${hotelId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        const data = await response.json();
        setHotelData(data);
        console.log(data);

        const roomResponse = await fetch(
          `http://localhost:3000/api/room/type/${roomId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        const roomData = await roomResponse.json();
        setRoomData(roomData);
        console.log(roomData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (hotelId != null && hotelData == null && roomData == null) {
      fetchData();
    }
  }, [hotelId, roomId]);

  const handleBookingRequest = async () => {
    if (user && hotelId && roomId) {
      const response = await fetch(
        "http://localhost:3000/api/hotel/reservation/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            user_id: user.Id,
            hotel_id: parseInt(hotelId, 10),
            room_id: parseInt(roomId, 10),
            check_in_date: new Date(inDate).getTime().toString(),
            check_out_date: new Date(outDate).getTime().toString(),
          }),
        }
      );

      const data = await response.json();

      console.log(data);
    }
  };

  return (
    <div className="middleize nav-pad flex-c">
      <div>
        {hotelData && roomData && (
          <div className="booking-parent-page">
            <div className="booking-page">
              <div style={{ gap: "10px" }}>
                <h2 style={{ marginBottom: "10px" }}>{hotelData.Name}</h2>
                <img
                  style={{ margin: "10px" }}
                  src={hotelData.MainImagePath}
                  alt=""
                />
              </div>

              <div className="booking paper">
                <h2>Check In/Out Details</h2>
                <div className="booking-details-separator">
                  <div className="booking-details">
                    <h3>In</h3>
                    <div style={{ width: "10px" }}>
                      <input
                        onChange={(e) => setInDate(e.target.value)}
                        type="date"
                      />
                    </div>
                  </div>
                  <div className="booking-details">
                    <h3>Out</h3>
                    <div style={{ width: "10px" }}>
                      <input
                        onChange={(e) => setOutDate(e.target.value)}
                        type="date"
                      />
                    </div>
                  </div>
                </div>
                {dateIntervalInDays && dateIntervalInDays > 0 ? (
                  <h3 style={{ color: "green", fontSize: "20px" }}>
                    {dateIntervalInDays.toString() + " Night"}
                  </h3>
                ) : (
                  inDate !== "" &&
                  outDate !== "" && (
                    <h3 style={{ color: "red", fontSize: "20px" }}>
                      Selected Check Out Date must be after the Check In Date
                    </h3>
                  )
                )}
              </div>

              {/* <Button></Button> */}
            </div>
            <div className="booking paper">
              <h2>Booking Details</h2>
              <hr
                style={{
                  color: "black",
                  width: "100%",
                  height: "0px",
                  border: "1px grey solid",
                }}
              />
              {dateIntervalInDays && dateIntervalInDays > 0 && roomData && (
                <div>
                  <div className="booking-details-pay">
                    <h3>Room Price</h3>
                    <h3 className="price-tag">
                      {toString(
                        hotelData.BasePrice *
                          roomData.BaseMultiplier *
                          dateIntervalInDays
                      )}
                    </h3>
                  </div>
                  <h4>
                    ({dateIntervalInDays}x) {roomData.Type} (
                    {dateIntervalInDays} Nights)
                  </h4>
                  <div className="booking-details-pay">
                    <h3>Service Tax</h3>
                    <h3 className="price-tag">
                      {toString(
                        (hotelData.BasePrice *
                          roomData.BaseMultiplier *
                          dateIntervalInDays) /
                          170
                      )}
                    </h3>
                  </div>
                  <div className="booking-details-pay">
                    <h3>Platform Tax</h3>
                    <h3 className="price-tag">{toString(5000)}</h3>
                  </div>
                  <hr
                    style={{
                      width: "100%",
                      height: "0px",
                      border: "1px grey solid",
                      marginTop: "20px",
                    }}
                  />{" "}
                  <div className="booking-details-pay">
                    <h3>Total Amount</h3>
                    <h3 className="price-tag" style={{ marginTop: "10px" }}>
                      <p>
                        {toString(
                          hotelData.BasePrice *
                            roomData.BaseMultiplier *
                            dateIntervalInDays +
                            (hotelData.BasePrice *
                              roomData.BaseMultiplier *
                              dateIntervalInDays) /
                              170 +
                            5000
                        )}
                      </p>
                    </h3>
                  </div>
                  <div className="booking-details-pay-x">
                    <div></div>
                    <Button
                      type={ButtonType.PRIMARY}
                      children={<>Buy Now</>}
                    ></Button>
                    <Button
                      type={ButtonType.FOURTH}
                      children={
                        <>
                          <Modalv2
                            div={<>Add to Cart</>}
                            toggleModal={toggleModal}
                            modal={modalOpened}
                            children={
                              <>
                                <div
                                  onClick={() => console.log("wow")}
                                  className="add-to-cart-booking-modal"
                                >
                                  <div>
                                    <img
                                      style={{ margin: "10px" }}
                                      src={hotelData.MainImagePath}
                                      alt=""
                                    />
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "10px",
                                    }}
                                  >
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
                                </div>
                              </>
                            }
                          ></Modalv2>
                        </>
                      }
                    ></Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
