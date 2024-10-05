import { useEffect, useState } from "react";
import "../../styles/main/main.scss";
import "../../styles/parts/hotel/CheckInOut.scss";
import { useCurrency } from "../../context/currency-provider";
import Button, { ButtonType } from "../button";

export default function CheckInOut({ hotel, onclick }: any) {
  const hotelInDate = hotel.HotelReservation.CheckInDate;
  const hotelOutDate = hotel.HotelReservation.CheckOutDate;
  const [inDate, setInDate] = useState<string>(formatDate(hotelInDate));
  const [outDate, setOutDate] = useState<string>(formatDate(hotelOutDate));
  const [hotelData, setHotelData] = useState<any>(hotel.HotelReservation.Hotel);
  const [roomData, setRoomData] = useState<any>(hotel.HotelReservation.Room);
  console.log(inDate,outDate)
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  }
  const [successText, setSuccessText] = useState("");

  const isValidDate = (dateString: string): boolean =>
    !isNaN(new Date(dateString).getTime());
  const inDateObj = isValidDate(inDate) ? new Date(inDate) : null;
  const outDateObj = isValidDate(outDate) ? new Date(outDate) : null;
  const dateInterval =
    inDateObj && outDateObj ? outDateObj.getTime() - inDateObj.getTime() : null;
  const dateIntervalInDays = dateInterval
    ? dateInterval / (1000 * 60 * 60 * 24)
    : null;

  const { toString } = useCurrency();

  async function handleUpdateCheckInOut() {
    const response = await fetch(`http://localhost:3000/api/reservation/hotel/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cart_id : hotel.ID,
        hotel_id : hotel.HotelReservation.Hotel.ID,
        room_id : hotel.HotelReservation.Room.ID,
        reservation_id : hotel.HotelReservation.ID,
        check_in_date: new Date(inDate).getTime().toString(),
        check_out_date: new Date(outDate).getTime().toString(),
      }),
    });
    if (response.ok){
        setSuccessText("Successfully updated the date")
    }
    const data = await response.json();
    console.log(data)
    onclick()
  }

  return (
    <>
      <div className="booking paper">
        <h2>Check In/Out Details</h2>
        <div className="booking-details-separator">
          <div className="booking-details">
            <h3>In</h3>
            <div style={{ width: "10px" }}>
              <input
                onChange={(e) => setInDate(e.target.value)}
                type="date"
                value={inDate}
              />
            </div>
          </div>
          <div className="booking-details">
            <h3>Out</h3>
            <div style={{ width: "10px" }}>
              <input
                onChange={(e) => setOutDate(e.target.value)}
                type="date"
                value={outDate}
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
              ({dateIntervalInDays}x) {roomData.Type} ({dateIntervalInDays}{" "}
              Nights)
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
                <h2>
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
                </h2>
              </h3>
            </div>
            <div className="booking-details-pay-x">
              <div></div>
              <Button
                text="Update Check In/Out"
                type={ButtonType.SIXTH}
                onClick={()=>handleUpdateCheckInOut()}
              ></Button>
            </div>
            <h2 style={{color:'green'}}>
                {successText}
            </h2>
          </div>
        )}
      </div>
    </>
  );
}
