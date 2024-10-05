import { useEffect, useState } from "react";
import "../../styles/home/home.scss";
import Modal from "../../components/modal";
import LoginPage from "../login/login-page";
import Button, { ButtonType } from "../../components/button";
import Slider from "../../components/slider/slider";
import { getAllPromo } from "../../context/db";
import PromoSlider from "../../components/reusables/promo-slider";
import HotelListing from "./hotel-listing";
import NavigationBar from "../../components/navbar";
import GlobalNavigator from "../../context/global-navigator";
import { useCurrency } from "../../context/currency-provider";
import MultiRangeSlider from "../../components/slider/multi-value-slider";
import CameraCapture from "../../components/camera/camera-capture";

export default function HomePage() {
  const [data, setData] = useState<string | null>(null);
  const [hotelData, setHotelData] = useState([]);
  const { navigateToHotelPage } = GlobalNavigator();
  const { selectedCurrencySymbol, convertPrice } = useCurrency();
  const [isTravelHovered, setIsTravelHovered] = useState(false);

  const fetchHotelRecommendationData = async () => {
    // console.log(isInputFocused, data.length);
    if (hotelData.length === 0) {
      try {
        const response = await fetch("http://localhost:3000/api/hotel/popular");
        const data = await response.json();
        setHotelData(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("http://localhost:3000/");
        const responseData = await response.text();
        console.log(responseData);
        await fetchHotelRecommendationData();
        setData(responseData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, []);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const promoData = await getAllPromo();
  //       console.log(promoData);
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  return (
    <>
      <div className="container">
        <div className="home-bg">
          <PromoSlider></PromoSlider>

          <div className="middle-container">
            <div
              className="why-travel"

            >
              <div className="why-travel-logo"               onMouseLeave={() => setIsTravelHovered(false)}
              onMouseEnter={() => setIsTravelHovered(true)}>
                {!isTravelHovered ? (
                  <>
                    <span className="material-symbols-outlined">help</span>
                    <h1>Why Travelohi?</h1>
                  </>
                ) : (
                  <>
 
                  <p>Travelohi delivers a ton of promos, happening every month. </p>

                  <p> And you as the customer gather points each time you make a purchase</p>
                
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="home-card middleize-c">
          {hotelData &&
            hotelData.map((e: any) => (
              <div key={e.ID} className="hotel-search-card paper">
                <div className="hotel-data-part">
                  <div className="left-part">
                    <img src={e.MainImagePath} alt={e.Name} />
                    <div className="image-grid">
                      {e.PicturePathJSON.slice(0, 3).map((p: any) => (
                        <img
                          className="control"
                          key={p}
                          src={p}
                          alt={`Photo ${p}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="right-part">
                    <div className="hotel-details">
                      <div className="hotel-detail-top">
                        <h2>{e.Name}</h2>
                        <div style={{ width: "100px" }}></div>
                        <h3>8.5</h3>
                      </div>

                      <h3>{e.Address}</h3>
                    </div>
                  </div>
                </div>

                <div className="price-offer">
                  <h3>
                    {selectedCurrencySymbol} {convertPrice(e.BasePrice)}
                  </h3>
                  <Button
                    onClick={() => {
                      navigateToHotelPage(e.ID);
                    }}
                    text="Select Room"
                    type={ButtonType.FOURTH}
                  ></Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
