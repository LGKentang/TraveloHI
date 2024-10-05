import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/main/main.scss";
import "../../styles/parts/airline/AirlineSearch.scss";
import Button, { ButtonType } from "../../components/button";
import { useCurrency } from "../../context/currency-provider";

export default function AirlineSearchPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.state);
  const query = queryParams.get("query");
  const [data, setData] = useState<any>([]);
  const { toString } = useCurrency();
  const navigate = useNavigate();
  const [filterTransit, setFilterTransit] = useState<boolean>(false);

  const [priceStart, setPriceStart] = useState(0);
  const [priceEnd, setPriceEnd] = useState(0);

  const [currentStartPrice, setCurrentStartPrice] = useState(0);
  const [currentEndPrice, setCurrentEndPrice] = useState(0);

  const [transitStart, setTransitStart] = useState(0);
  const [transitEnd, setTransitEnd] = useState(0);

  const [currentTransitStart, setCurrentTransitStart] = useState(0);
  const [currentTransitEnd, setCurrentTransitEnd] = useState(0);

  const [durationStart, setDurationStart] = useState(0);
  const [durationEnd, setDurationEnd] = useState(0);

  const [currentDurationStart, setCurrentDurationStart] = useState(0);
  const [currentDurationEnd, setCurrentDurationEnd] = useState(0);

  const [sortBy, setSortBy] = useState("price");
  const [sortOrder, setSortOrder] = useState("ascending");

  const [filteredData, setFilteredData] = useState<any[]>([]);

  const handleTransitFilterChange = (e: any) => {
    setFilterTransit(e.target.checked);
  };

  useEffect(() => {
    const newData = data.slice().sort(activateSort).filter(activateFilter);
    setFilteredData(newData);
    console.log(newData);
  }, [filterTransit, sortBy, sortOrder]);

  const activateFilter = (e: any) => {
    console.log(filterTransit);
    if (filterTransit) {
      return e.label === "transit";
    }
    return true;
  };

  const activateSort = (a: any, b: any) => {
    console.log(a.totalPrice, b.totalPrice)
    if (sortBy === "price") {
      if (sortOrder === "desc") {
        return b.totalPrice - a.totalPrice;
      }
      return a.totalPrice - b.totalPrice;
    }
    else if (sortBy === "transit"){
      if (sortOrder === "desc"){
        return b.transitCount - a.transitCount;
      }
      return a.transitCount - b.transitCount;
    }
    else if (sortBy === "duration"){
      if (sortOrder === "desc"){
        return b.totalDuration - a.totalDuration;
      }
      return a.totalDuration - b.totalDuration;
    }

  };
  const handleSortOrder = (e: any) => {
    setSortOrder(e.target.value);
  };

  useEffect(() => {
    if (query) {
      (async () => {
        const response = await fetch(
          `http://localhost:3000/api/flights/airline/${query}`
        );
        const data = await response.json();
        console.log(data);
        setData(data);
        setFilteredData(data);

        // setPriceStart()
      })();
    }
  }, []);

  const handleFlightReservationRedirection = (flightScheduleId: number) => {
    navigate(`/home/flight/reservation`, {
      state: { query: flightScheduleId },
    });
    window.location.reload();
  };

  return (
    <>
      <div className="middleize nav-pad airline-parent-parent">
        <div className="airline-parent">
          <div className="airline-filter">
            <div className="filter paper">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-around",
                }}
              >
                <div className="transit-input">
                  <h2>Transits</h2>
                  <input
                    type="checkbox"
                    checked={filterTransit}
                    onChange={handleTransitFilterChange}
                  />
                </div>
                {/* <Button text="Filter" type={ButtonType.PRIMARY} /> */}
              </div>
            </div>

            <div className="filter paper">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-around",
                }}
              >
                <div className="transit-sort">
                  <h2>Sort By</h2>
                  <div className="containerrrr">
                    <div className="select-container">
                      <select onChange={(e) => setSortBy(e.target.value)}>
                        <option value="price">Price</option>
                        <option value="transit">Transits</option>
                        <option value="duration">Duration</option>
                      </select>
                    </div>

                    <div className="select-container">
                      <select onChange={handleSortOrder}>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                        
                      </select>
                    </div>
                  </div>
                </div>
                {/* <Button text="Filter" type={ButtonType.PRIMARY} /> */}
              </div>
            </div>
          </div>

          <div className="airline-searches">
            {filteredData &&
              filteredData.map((flightData: any) => {
                if (flightData.label === undefined) {
                  return (
                    <>
                      <div className="flight-card paper">
                        <div className="flight-card-upper">
                          <div className="dfc g-10">
                            <img
                              src={flightData.flight.Airline.Logo}
                              alt="logo"
                            />
                            <h2>{flightData.flight.Airline.Name}</h2>
                          </div>

                          <div className="dfc g-40">
                            <div className="flight-time-loc">
                              <div className="flight-data-component">
                                <p>
                                  {new Date(
                                    flightData.flight.FlightDepartureDate
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    // hour12: false,
                                  })}
                                </p>
                                <strong>
                                  {flightData.flight.OriginAirport.Code}
                                </strong>
                              </div>

                              <div className="flight-data-component">
                                <p>{flightData.flight.FlightDuration}m</p>
                                <p> {"Direct"}</p>
                              </div>

                              <div className="flight-data-component">
                                <p>
                                  {" "}
                                  {new Date(
                                    flightData.flight.FlightArrivalDate
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    // hourCycle:'h23',
                                    // hour12: false,
                                  })}
                                </p>
                                <strong>
                                  {" "}
                                  {flightData.flight.DestinationAirport.Code}
                                </strong>
                              </div>
                            </div>

                            <div>
                              {toString(flightData.flight.BasePrice)} / person
                            </div>
                          </div>
                        </div>
                        <div className="flight-card-lower">
                          <div></div>

                          <Button
                            type={ButtonType.PRIMARY}
                            text="Select"
                            onClick={() =>
                              handleFlightReservationRedirection(
                                flightData.flight.FlightScheduleId
                              )
                            }
                          ></Button>
                        </div>
                      </div>
                    </>
                  );
                } else {
                  return (
                    <>
                      <div className="flight-card paper">
                        <div className="flight-card-upper">
                          <div className="dfc g-10">
                            
                            <img
                              src={flightData.flight.Airline.Logo}
                              alt="logo"
                            />
                            <h2>{flightData.flight.Airline.Name}</h2>
                          </div>

                          <div className="dfc g-40">
                            <div className="flight-time-loc">
                              <div className="flight-data-component">
                                <p>
                                  {new Date(
                                    flightData.segment.OriginSegment.FlightDepartureDate
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })}
                                </p>
                                <strong>
                                  {
                                    flightData.segment.OriginSegment
                                      .OriginAirport.Code
                                  }
                                </strong>
                              </div>

                              <div className="flight-data-component">
                                <p>{flightData.totalDuration}m</p>
                                <p>{flightData.transitCount} Transit</p>
                              </div>

                              <div className="flight-data-component">
                                <p>
                                  {" "}
                                  {new Date(
                                    flightData.segment.DestinationSegment.FlightArrivalDate
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })}
                                </p>
                                <strong>
                                  {" "}
                                  {
                                    flightData.segment.DestinationSegment
                                      .DestinationAirport.Code
                                  }
                                </strong>
                              </div>
                            </div>

                            <div>
                              {toString(flightData.totalPrice)} / person
                            </div>
                          </div>
                        </div>
                        <div className="flight-card-lower">
                          <div></div>

                          <Button
                            type={ButtonType.PRIMARY}
                            text="Select"
                            onClick={() =>
                              handleFlightReservationRedirection(
                                flightData.flight.FlightScheduleId
                              )
                            }
                          ></Button>
                        </div>
                      </div>
                    </>
                  );
                }
              })}
          </div>
        </div>
      </div>
    </>
  );
}
