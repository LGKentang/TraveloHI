/* HotelSearchPage.jsx */
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/main/main.scss";
import "../../styles/parts/hotel/HotelSearch.scss";
import Button, { ButtonType } from "../../components/button";
import GlobalNavigator from "../../context/global-navigator";
import { useCurrency } from "../../context/currency-provider";
import MultiRangeSlider from "../../components/slider/multi-value-slider";

export default function HotelSearchPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.state);
  const query = queryParams.get("query");
  const [data, setData] = useState<any>([]);
  const { navigateToHotelPage } = GlobalNavigator();
  const { selectedCurrency, selectedCurrencySymbol, convertPrice } =
    useCurrency();

  const paginationSize = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState<number | null>(null);

  // range filter
  const [priceStart, setPriceStart] = useState(0);
  const [priceEnd, setPriceEnd] = useState(0);
  const [currentStartPrice, setCurrentStartPrice] = useState(0);
  const [currentEndPrice, setCurrentEndPrice] = useState(0);

  const [currentRatingStart, setcurrentRatingStart] = useState(0);
  const [currentRatingEnd, setcurrentRatingEnd] = useState(0);

  const [availableRoomStart, setAvailableRoomStart] = useState(0);
  const [availableRoomEnd, setAvailableRoomEnd] = useState(0);
  const [currentAvailableRoomStart, setCurrentAvailableRoomStart] = useState(0);
  const [currentAvailableRoomEnd, setCurrentAvailableRoomEnd] = useState(0);

  const [useRelevance, setUseRelevance] = useState<boolean>(false);

  const [selectedFacilities, setSelectedFacilities] = useState<any[]>([]);

  // sorting filter
  const [sortBy, setSortBy] = useState("rating");
  const [sortOrder, setSortOrder] = useState("ascending");
  // console.log(useRelevance);
  // filtered data
  const [filteredData, setFilteredData] = useState<any[]>([]);

  const countries = [
    "brazil",
    "canada",
    "finland",
    "japan",
    "united-kingdom",
    "united_states",
    "unlabeled",
  ];

console.log(selectedFacilities)
  const handleFacilityChange = (facility: any) => {
    if (selectedFacilities.includes(facility)) {
      setSelectedFacilities(selectedFacilities.filter((f) => f !== facility));
    } else {
      setSelectedFacilities([...selectedFacilities, facility]);
    }
  };

  const nextPage = () => {
    if (totalPage && currentPage + 1 <= totalPage)
      setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage - 1 > 0) setCurrentPage(currentPage - 1);
  };

  const changePriceStart = (e: any) => {
    const value = e.target.value;
    // setPriceStart(parseInt(value));
  };

  const handleSortOrder = (e: any) => {
    if (e.target.value === "relevance") {
      setUseRelevance(true);
    } else {
      setSortOrder(e.target.value);
      setUseRelevance(false);
    }
  };

  // console.log(currentAvailableRoomStart)
  // console.log(currentAvailableRoomEnd)
  const activateFilter = (e: any) => {
    console.log(e.AvailableRooms)
    console.log(currentAvailableRoomStart)
    // console.log(cure)
    return (
      e.BasePrice >= currentStartPrice &&
      e.BasePrice <= currentEndPrice &&
      e.Rating >= currentRatingStart &&
      e.Rating <= currentRatingEnd &&
      e.AvailableRooms >= currentAvailableRoomEnd
       &&
      e.AvailableRooms <= currentAvailableRoomStart
    );
  };

  const activateSort = (a: any, b: any) => {
    if (sortBy === "rating") {
      if (sortOrder === "desc") {
        return b.Rating - a.Rating;
      }
      return a.Rating - b.Rating;
    } else if (sortBy === "price") {
      if (sortOrder === "desc") {
        return b.BasePrice - a.BasePrice;
      }
      return a.BasePrice - b.BasePrice;
    }
  };

  const activateFacilityFilter = (facilities: any): boolean => {
    // Check if every selected facility exists in the facilities array
    // console.log(facilities.MainFacilitiesJSON)

    // return true
    return selectedFacilities.every((facility) => facilities.MainFacilitiesJSON.includes(facility));
  };
  
  useEffect(() => {
    const newData = useRelevance
      ? data
      : data.slice().sort(activateSort).filter(activateFilter).filter(activateFacilityFilter);
    setFilteredData(newData);
    console.log(newData);
  }, [
    data,
    useRelevance,
    sortOrder,
    sortBy,
    currentStartPrice,
    currentEndPrice,
    currentRatingEnd,
    currentRatingStart,
    selectedFacilities,
    currentAvailableRoomEnd,
    currentAvailableRoomStart,
  ]);

  // const filteredAndSortedData = useRelevance ? data : data.sort(activateSort).filter(activateFilter);

  const displayedData = filteredData.slice(
    (currentPage - 1) * paginationSize,
    currentPage * paginationSize
  );

  useEffect(() => {
    setTotalPage(Math.ceil(filteredData.length / paginationSize));
  }, [filteredData]);

  // Add filteredAndSortedData as a dependency
  // useEffect(() => {
  //   console.log(Math.ceil(filteredAndSortedData.length / paginationSize));
  //   // console.log(displayedData);
  //   setTotalPage(Math.ceil(filteredAndSortedData.length / paginationSize));
  // }, [filteredAndSortedData]);

  const changeDataCurrency = async () => {
    const updatedData = data.map((item: any) => {
      if (item.BasePrice) {
        return {
          ...item,
          BasePrice: convertPrice(item.BasePrice),
        };
      } else {
        return item;
      }
    });
    // Set the updated data state
    setData(updatedData);
  };
  useEffect(() => {
    async function updateCurrency() {
      console.log(selectedCurrency);
      await changeDataCurrency();
      setPriceStart(convertPrice(priceStart));
      setPriceEnd(convertPrice(priceEnd));
      setCurrentStartPrice(convertPrice(currentStartPrice));
      setCurrentEndPrice(convertPrice(currentEndPrice));
    }
    updateCurrency();
  }, [selectedCurrency]);

  const handleStartPriceChange = (value: any) => {
    // Ensure that currentStartPrice is less than currentEndPrice
    if (value < currentEndPrice) {
      setCurrentStartPrice(value);
    } else {
      // Adjust currentEndPrice if necessary
      setCurrentEndPrice(value + 1); // You can choose how to handle this case
    }
  };

  const handleEndPriceChange = (value: any) => {
    if (value > currentStartPrice) {
      setCurrentEndPrice(value);
    } else {
      if (currentStartPrice == 0) setCurrentStartPrice(value);
      else setCurrentStartPrice(value - 1);
    }
  };

  // useEffect(() => {
  //   console.log(filteredData.length)
  // }, [filteredData]);

  // console.log(totalPage);
  useEffect(() => {
    (async () => {
      if (query) {
        const lowercaseQuery = query.toLowerCase();
        if (countries.includes(lowercaseQuery)) {
          const response = await fetch(
            `http://localhost:3000/api/hotel/search/address/${query}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );
          const data = await response.json();
          const length = data.length;

          setTotalPage(Math.ceil(length / paginationSize));
          setData(data);
          console.log(data);
        } else {
          const response = await fetch(
            `http://localhost:3000/api/hotel/search/${query}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );
          const data = await response.json();
          const length = data.length;

          // console.log(length);
          console.log(paginationSize);
          setTotalPage(Math.ceil(length / paginationSize));

          const sortedData = [...data];
          sortedData.sort((a, b) => a.BasePrice - b.BasePrice);
          setPriceEnd(sortedData[sortedData.length - 1].BasePrice);

          const sortedDataByAvailableRoom = [...data];
          sortedDataByAvailableRoom.sort((a, b) => a.AvailableRooms - b.AvailableRooms);
          setAvailableRoomEnd(sortedDataByAvailableRoom[sortedDataByAvailableRoom.length - 1].AvailableRooms);
          console.log(sortedDataByAvailableRoom)
          setData(data);
          setFilteredData(data);
          console.log(data);
        }
      }
    })();
  }, []);

  // console.log(filteredData.sort(activateSort).filter(activateFilter));
  return (
    <>
      <div className="middleize nav-pad flex-c hotel-search-parent-parent">
        <p>
          Search results for <span>{query}</span>
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button text="<" onClick={prevPage}></Button>
          <p>{currentPage}</p>
          <Button text=">" onClick={nextPage}></Button>
        </div>

        <div className="hotel-search-parent">
          <div className="filter-tab">
            <div className="filter paper-np">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-around",
                }}
              >
                <h2>Range Between</h2>
                {/* <Button text="Filter" type={ButtonType.PRIMARY} /> */}
              </div>
              <div className="range-slider">
                <div className="slider-component">
                  <h2>Price</h2>
                  {priceEnd != 0 && (
                    <MultiRangeSlider
                      min={convertPrice(priceStart)}
                      max={convertPrice(priceEnd)}
                      symbol={selectedCurrencySymbol}
                      onChange={({
                        min,
                        max,
                      }: {
                        min: number;
                        max: number;
                      }) => {
                        setCurrentStartPrice(min);
                        setCurrentEndPrice(max);
                      }}
                    />
                  )}
                </div>
                <div className="slider-component">
                  <h2>Rating</h2>
                  <MultiRangeSlider
                    min={0}
                    max={5}
                    onChange={({ min, max }: { min: number; max: number }) => {
                      setcurrentRatingStart(min);
                      setcurrentRatingEnd(max);
                    }}
                  />
                </div>
                <div className="slider-component">
                  <h2>Available Rooms</h2>
                  {availableRoomEnd != 0 && (
                    <MultiRangeSlider
                      min={availableRoomStart}
                      max={availableRoomEnd}
                      onChange={({
                        min,
                        max,
                      }: {
                        min: number;
                        max: number;
                      }) => {
                        setCurrentAvailableRoomEnd(min);
                        setCurrentAvailableRoomStart(max)
                      }}
                    />
                  )}
                </div>

                {/* <div className="slider"> */}

                {/* <h2>Price (${currentStartPrice} - ${currentEndPrice})</h2> */}
                {/* <input
                  type="range"
                  min="0"
                  max={priceEnd}
                  value={currentStartPrice}
                  onChange={(e) => handleStartPriceChange(parseInt(e.target.value))}
                /> */}
                {/* <input
                  type="range"
                  min="0"
                  max={priceEnd}
                  value={currentEndPrice}
                  onChange={(e) => handleEndPriceChange(parseInt(e.target.value))}
                /> */}

                {/* </div> */}
              </div>
            </div>
            <div className="filter paper-np sort-container">
              <h2>Sort By</h2>
              <div className="containerrrr">
                <div className="select-container">
                  <select onChange={(e) => setSortBy(e.target.value)}>
                    <option value="rating">Rating</option>
                    <option value="price">Price</option>
                  </select>
                </div>

                <div className="select-container">
                  <select onChange={handleSortOrder}>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                    <option value="relevance">Relevance</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="filter paper-np">
              <h2>Facilities</h2>
              <div className="facilities-pick">
                <input
                  type="checkbox"
                  onChange={() => handleFacilityChange("Gym")}
                  checked={selectedFacilities.includes("Gym")}
                />
                <p>Gym</p>
              </div>
              <div className="facilities-pick">
                <input
                  type="checkbox"
                  onChange={() => handleFacilityChange("Swimming Pool")}
                  checked={selectedFacilities.includes("Swimming Pool")}
                />
                <p>Swimming Pool</p>
              </div>
              <div className="facilities-pick">
                <input
                  type="checkbox"
                  onChange={() => handleFacilityChange("WiFi")}
                  checked={selectedFacilities.includes("WiFi")}
                />
                <p>Free Wifi</p>
              </div>
              <div className="facilities-pick">
                <input
                  type="checkbox"
                  onChange={() => handleFacilityChange("Bar")}
                  checked={selectedFacilities.includes("Bar")}
                />
                <p>Bar</p>
              </div>
              <div className="facilities-pick">
                <input
                  type="checkbox"
                  onChange={() => handleFacilityChange("Parking")}
                  checked={selectedFacilities.includes("Parking")}
                />
                <p>Parking</p>
              </div>
            </div>
          </div>

          <div className="search-results">
            {displayedData && displayedData.length != 0 ? (
              displayedData.map((e: any) => (
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
                          <h3>{e.Rating}</h3>
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
              ))
            ) : (
              <p>No results found :(</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
