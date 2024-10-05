import { useEffect, useState } from "react";
import "../../styles/parts/hotel/hotel.scss";
import Button, { ButtonType } from "../../components/button";
import { Hotel } from "../../interface/hotel-interface";


export default function HotelListing() {
  const [hotels, setHotels] = useState<Hotel[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/hotel/all");
        const data = await response.json();

        const allData: Hotel[] | null = data.map((item: any) => ({
          ID: item.ID,
          Name: item.Name,
          Description: item.Description,
          Address: item.Address,
          MainImagePath: item.MainImagePath,
          PicturePathJSON: item.PicturePathJSON,
          Rating: item.Rating,
        }));
        setHotels(allData);
      } catch (error) {
        console.error("Error fetching hotel data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {hotels &&
        hotels.map((hotel: Hotel) => (
          <div className="paper" key={hotel.ID}>
            <div className="hotel-card">
              <div className="desc">
                <div className="left-desc">
                  <h1>{hotel.Name}</h1>
                  <p>{hotel.Address}</p>
                  
                </div>
                <div className="right-desc">
                    <div>
                  <p>Price/room/night starts from</p>
                  <h2>Rp 500.000</h2>
                  <Button
                    onClick={() => {}}
                    text="Select Room"
                    type={ButtonType.FOURTH}
                  ></Button>

                    </div>

                    
                </div>
              </div>

              <div className="hotel-photos">
                <div className="left-photos">
                  <img src={hotel.MainImagePath} alt={hotel.Name} />
                </div>
                <div className="right-photos">
                    {/* <p></p> */}
                    {/* <img src={hotel.MainImagePath} alt="" /> */}
                  {hotel &&
                    hotel.PicturePathJSON.map((e: any, index: number) => {
                      if (typeof e === "string") {
                        return (
                          <img className="control" key={index} src={e} alt={`Photo ${index}`} />
                        );
                      }
                    })}
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
