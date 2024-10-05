import { useState, useEffect } from "react";
import "../../styles/components/SearchBar/searchbar.scss";
import { useNavigate } from "react-router-dom";
import useUser from "../../context/user-provider";
import Modal from "../modal";
import Button from "../button";
import Modalv2 from "../modalv2";
import { debounce } from "../../context/util";

export default function SearchBar() {
  const { user } = useUser();
  const [value, setValue] = useState("");
  const [data, setData] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSearchHotelState, setIsSearchHotelState] = useState(true);

  const [buttonPosition, setButtonPosition] = useState("0");
  const [iconColor, setIconColor] = useState("#1e63e3ef");
  const [selectedImage, setSelectedImage] = useState(null);
  const [fileError, setFileError] = useState("");
  const [predictSuccess, setPredictSuccess] = useState("");
  const [queriedResult, setQueriedResult] = useState<any>(null);

  const [modal, setModal] = useState(false);

  const [airlineData, setAirlineData] = useState<any>([]);

  const toggleModal = () => {
    setModal(!modal);
  };

  const fetchPrefixQueriedHotel = async (inputValue: string) => {
    if (isSearchHotelState) {
      const response = await fetch(
        `http://localhost:3000/api/hotel/get/prefixQuery/${inputValue}`
      );
      const data = await response.json();

      console.log(data);
      setQueriedResult(data);
    }
  };



  const handleFileChange = (event: any) => {
    const file = event.target.files[0];

    if (file) {
      if (file.type && file.type.startsWith("image/")) {
        setSelectedImage(file);
        setFileError("");
      } else {
        setSelectedImage(null);
        setFileError(
          "Selected file is not an image. Please choose an image file."
        );
      }
    }
  };

  const navigate = useNavigate();

  const sendImageSearch = async () => {
    if (selectedImage) {
      const formData = new FormData();
      formData.append("image", selectedImage);

      const flask_response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });

      const flask_data = await flask_response.json();
      const prediction = flask_data.predictions;

      console.log(prediction);

      if (prediction != null) {
        setPredictSuccess("Prediction successful, redirecting you now...");
        setTimeout(() => {
          navigate("/home/search_hotels", { state: { query: prediction } });
          toggleModal();
          setPredictSuccess("");
        }, 1000);
      }
    }
  };

  // useEffect(() => {
  //   (async () => {
  //     const response = await fetch("http://localhost:5000/");
  //     const data = await response.json();

  //     console.log(data);
  //   })();
  // }, []);

  const fetchHotelRecommendationData = async () => {
    // console.log(isInputFocused, data.length);
    if (data.length === 0) {
      try {
        const response = await fetch("http://localhost:3000/api/hotel/popular");
        const data = await response.json();
        setData(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  const fetchUserSearchHistory = async () => {
    if (user) {
      const fetchType = isSearchHotelState ? "hotel" : "flight";
      const response = await fetch(
        `http://localhost:3000/api/user/searchHistory/${user.Id}/${fetchType}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      setSearchHistory(data);
    }
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    if (isSearchHotelState) fetchHotelRecommendationData();
    if (!isSearchHotelState) fetchAllAirlineData();
    if (user) fetchUserSearchHistory();
  };

  const fetchAllAirlineData = async () => {
    if (airlineData.length === 0) {
      const response = await fetch("http://localhost:3000/api/airline/all");
      const data = await response.json();
      console.log(data)
      setAirlineData(data);
    }
  }

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsInputFocused(false);
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    console.log("Input value:", inputValue);

    setValue(inputValue);
    fetchPrefixQueriedHotel(inputValue);
  };

  // useEffect(() => {}, []);

  const alterInputThenSearch = (input: string) => {
    setValue(input);
    if (isSearchHotelState)
      navigate("/home/search_hotels", { state: { query: input } });
  };

  const navigateToSearchPage = async () => {
    if (value === "") return;
    saveSearchResult();

    console.log(isSearchHotelState)
    if (isSearchHotelState) navigate("/home/search_hotels", { state: { query: value } });
    else {
      const airlineId = await searchBestAirlineQuery();
      navigate("/home/airline", { state: { query: airlineId.closest_airline_id }});
    }
  };

  const searchBestAirlineQuery = async () => {
    const response = await fetch(`http://localhost:3000/api/airline/search/${value}`);
    const data = await response.json();
    console.log(data)
    return data;
  }

  const saveSearchResult = async () => {
    if (user) {
      const sendData = JSON.stringify({
        query: value,
        userId: user?.Id,
        type: isSearchHotelState ? "hotel" : "flight",
      });

      await fetch("http://localhost:3000/api/user/createSearchHistory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: sendData,
      });
    }
  };

  const navigateToHotelPage = (id: number) => {
    console.log(id);
    navigate("/home/hotel", { state: { hotelId: id } });
    window.location.reload();
  };

  const navigateToAirlinePage = (id: number) => {
    console.log(id);
    navigate("/home/airline", { state: { query: id } });
    window.location.reload();
  };

  const leftClick = () => {
    setIsSearchHotelState(true);
    setButtonPosition("0");
    setIconColor("#1e63e3ef");
  };

  const rightClick = () => {
    setIsSearchHotelState(false);
    setButtonPosition("58.8px");
    setIconColor("#f58e07");
  };

  return (
    <>
      <div className="search">
        <div className="search-container">
          <div className="button-box">
            <div
              className="main-btn"
              style={{ left: buttonPosition, background: iconColor }}
            ></div>
            <button type="button" className="toggle-btn" onClick={leftClick}>
              <span className="material-symbols-outlined">apartment</span>
            </button>
            <button type="button" className="toggle-btn" onClick={rightClick}>
              <span className="material-symbols-outlined">
                airplanemode_active
              </span>
            </button>
          </div>

          <input
            type="text"
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onChange={handleInputChange}
            className="search-input"
            value={value}
          />
          <span
            className="material-symbols-outlined"
            onClick={navigateToSearchPage}
          >
            search
          </span>
          <Modalv2
            toggleModal={toggleModal}
            modal={modal}
            children={
              <>
                <div className="paper image-upload">
                  {selectedImage && (
                    <div>
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Selected"
                        style={{ maxWidth: "100%" }}
                      />
                    </div>
                  )}
                  <p>{fileError}</p>
                  <p>{predictSuccess}</p>
                  <div>
                    <input type="file" onChange={handleFileChange} />
                    <Button
                      text="Search Image"
                      onClick={sendImageSearch}
                    ></Button>
                  </div>
                </div>
              </>
            }
            div={
              <span
                style={{ margin: "0px 4px" }}
                className="material-symbols-outlined"
              >
                photo
              </span>
            }
          ></Modalv2>
        </div>
        {isInputFocused && isSearchHotelState && (
          <div className="dropdown-content">
            {/* <div> */}
            {/* <p className="recent-searches">Recent searches</p>
            </div> */}

            <div className="search-history">
              {searchHistory &&
                searchHistory.map((searchHistory, index) => (
                  <div className="search-text-div" key={index + "a"}>
                    <div
                      className="search-text-align-left"
                      onClick={() => alterInputThenSearch(searchHistory)}
                    >
                      <p key={index + "b"}>{searchHistory}</p>
                    </div>

                    <hr className="expand-hr" />
                  </div>
                ))}
            </div>

            <div className="recommended-search">
              {/* {
                queriedResult.length > 0 && queriedResult !== null ? 
                queriedResult.map((item: any, index: number) => ()
              
                
                : ""
              } */}

              {queriedResult && queriedResult.length > 0
                ? queriedResult.map((item: any, index: number) => (
                    <div
                      onClick={() => navigateToHotelPage(item.ID)}
                      className="paper expand-to-parent"
                      key={index}
                    >
                      <img src={item.MainImagePath} alt="" />
                      <p>
                        <strong>{item.Name.slice(0, value.length)}</strong>
                        {item.Name.slice(value.length)}
                      </p>
                    </div>
                  ))
                : data.map((item: any, index: number) => (
                    <div
                      onClick={() => navigateToHotelPage(item.ID)}
                      className="paper expand-to-parent"
                      key={index}
                    >
                      <img src={item.MainImagePath} alt="" />
                      <p>{item.Name as string}</p>
                    </div>
                  ))}
            </div>
          </div>
        )}

        {isInputFocused && !isSearchHotelState && (
          <div className="dropdown-content">
            {/* <div> */}
            {/* <p className="recent-searches">Recent searches</p>
            </div> */}

            {/* <div className="search-history">
              {searchHistory &&
                searchHistory.map((searchHistory, index) => (
                  <div className="search-text-div" key={index + "a"}>
                    <div
                      className="search-text-align-left"
                      onClick={() => alterInputThenSearch(searchHistory)}
                    >
                      <p key={index + "b"}>{searchHistory}</p>
                    </div>

                    <hr className="expand-hr" />
                  </div>
                ))}
            </div> */}

            <div className="recommended-search">
              {airlineData.map((item: any, index: number) => (
                <div
                  onClick={() => navigateToAirlinePage(item.ID)}
                  className="paper expand-to-parent-a"
                  key={index}
                >
                  <img src={item.Logo} alt="" />
                  <p>{item.Name as string}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
