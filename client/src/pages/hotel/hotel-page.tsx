import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button, { ButtonType } from "../../components/button";
import "../../styles/parts/hotel/hotel.scss";
import "../../styles/main/main.scss";
import Modal from "../../components/modal";
import { useCurrency } from "../../context/currency-provider";

export default function HotelPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.state);
  const hotelId = queryParams.get("hotelId");
  const [hotelData, setHotelData] = useState<any>(null);
  const { selectedCurrencySymbol, convertPrice, toString } = useCurrency();
  const [Facilities, setFacilities] = useState([]);
  const [roomFacilitiesData, setRoomFacilitiesData] = useState<any[]>([]);
  const targetDivRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleSelectRoomClick = () => {
    if (targetDivRef.current) {
      targetDivRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (hotelId != null) {
      (async () => {
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
        setFacilities(data.MainFacilitiesJSON);
        setHotelData(data);

        await fetch(`http://localhost:3000/api/hotel/search_count/${hotelId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        const roomFacilitiesResponse = await fetch(
          `http://localhost:3000/api/hotel/rooms/facilities/all/${hotelId}`
        );
        const roomFacilitiesData = await roomFacilitiesResponse.json();
        setRoomFacilitiesData(roomFacilitiesData);
        console.log(roomFacilitiesData);
      })();
    }
  }, []);

  const renderStars = (hotelStars: number) => {
    const stars = [];
    for (let i = 0; i < Math.round(hotelStars); i++) {
      stars.push(
        <img key={i} style={{ height: "20px" }} src="/asset/star.png" alt="" />
      );
    }
    return stars;
  };

  const handleRedirectToBuy = (roomId: number, hotelId: number) => {
    navigate(`/home/hotel/booking/${hotelId}/${roomId}`);
  };

  return (
    <>
      <div className="middleize nav-tab flex-c">
        <div className="hotel-page ">
          {hotelData && (
            <div key={hotelData.ID}>
              <div className="hotel-card">
                <div className="desc">
                  <div className="left-desc">
                    <h1>{hotelData.Name}</h1>

                    {renderStars(hotelData.Stars).map((star) => star)}

                    <p>{hotelData.Address}</p>
                  </div>
                  <div className="right-desc">
                    <div>
                      <p>Price/room/night starts from</p>
                      <h2>
                        {selectedCurrencySymbol}{" "}
                        {convertPrice(hotelData.BasePrice)}
                      </h2>
                      <Button
                        onClick={handleSelectRoomClick}
                        text="Select Room"
                        type={ButtonType.FOURTH}
                      ></Button>
                    </div>
                  </div>
                </div>

                <div className="hotel-photos">
                  <div className="left-photos">
                    <img src={hotelData.MainImagePath} alt={hotelData.Name} />
                    <div className="overlay-review">
                      <div className="blue-circle">
                        <h2>{hotelData.Rating * 2}</h2>
                      </div>
                    </div>
                  </div>
                  <div className="right-photos">
                    {hotelData &&
                      hotelData.PicturePathJSON.map((e: any, index: number) => {
                        if (typeof e === "string") {
                          return (
                            <img
                              className="control"
                              key={index}
                              src={e}
                              alt={`Photo ${index}`}
                            />
                          );
                        }
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {hotelData && (
            <div className="hotel-details-card">
              <div className="detail-card paper-nps">
                <div className="detail-card-header">
                  <h2>About Accomodation</h2>
                  <Modal
                    children={
                      <>
                        <div style={{ margin: "20px" }}>
                          {hotelData.Description}
                        </div>
                      </>
                    }
                    div={
                      <div className="centerize-header">
                        Read More
                        <span className="material-symbols-outlined">
                          chevron_right
                        </span>
                      </div>
                    }
                  ></Modal>
                </div>

                <div className="detail-card-body">
                  {hotelData.Description && hotelData.Description.length > 200
                    ? `${hotelData.Description.slice(0, 200)}...`
                    : hotelData.Description}
                </div>
              </div>

              <div className="detail-card paper-nps">
                <div className="detail-card-header">
                  <h2>In the Area</h2>
                  <Modal
                    children={<>{hotelData.Description}</>}
                    div={
                      <div className="centerize-header">
                        Read More
                        <span className="material-symbols-outlined">
                          chevron_right
                        </span>
                      </div>
                    }
                  ></Modal>
                </div>
              </div>

              <div className="detail-card paper-nps">
                <div className="detail-card-header">
                  <h2>Highlights at This Property</h2>
                  <Modal
                    children={<>{hotelData.Description}</>}
                    div={
                      <div className="centerize-header">
                        Read More
                        <span className="material-symbols-outlined">
                          chevron_right
                        </span>
                      </div>
                    }
                  ></Modal>
                </div>
              </div>
            </div>
          )}

          {hotelData && (
            <div className="hotel-details-card">
              <div className="detail-card paper-nps">
                <div className="detail-card-header">
                  <h2>Main Facilities</h2>
                  <Modal
                    children={<>{hotelData.Description}</>}
                    div={
                      <div className="centerize-header">
                        Read More
                        <span className="material-symbols-outlined">
                          chevron_right
                        </span>
                      </div>
                    }
                  ></Modal>
                </div>
                <div>
                  {Facilities &&
                    Facilities.map((e: any, index: number) => {
                      if (typeof e === "string") {
                        return <p key={index}>{e}</p>;
                      }
                    })}
                </div>

                <div className="detail-card-body"></div>
              </div>

              <div className="detail-card-b paper-nps">
                <div className="detail-card-header">
                  <h2>What Guests Say About Their Stay</h2>
                  <Modal
                    children={<>{hotelData.Description}</>}
                    div={
                      <div className="centerize-header">
                        Read More
                        <span className="material-symbols-outlined">
                          chevron_right
                        </span>
                      </div>
                    }
                  ></Modal>
                </div>
              </div>
            </div>
          )}

          {/* // start sini lg */}

          <div ref={targetDivRef}></div>
          {roomFacilitiesData &&
            hotelData &&
            roomFacilitiesData.map((room, index) => (
              <div key={index} className="paper expand">
                <div>
                  <p>Room Type: {room.Type}</p>
                  <p>

                    {toString((room.BaseMultiplier * hotelData.BasePrice))}
                  
                    / night
                  </p>
                  <ul>
                    {room.FacilitiesJSON.map(
                      (facility: string, facilityIndex: number) => (
                        <li key={facilityIndex}>{facility}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <Button
                    type={ButtonType.FOURTH}
                    text="Book Now"
                    onClick={() =>
                      handleRedirectToBuy(room.ID, hotelData.ID)
                    }
                  ></Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
