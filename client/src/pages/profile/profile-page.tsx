import { useEffect, useRef, useState } from "react";
import useUser from "../../context/user-provider";
import "../../styles/main/main.scss";
import "../../styles/parts/profile/ProfilePage.scss";
import Modalv3 from "../../components/modalv3";
import CreditCard from "../../components/reusables/credit-card";
import TextField from "../../components/text-field";
import Button, { ButtonType } from "../../components/button";
import { useNavigate } from "react-router-dom";
import Modalv4 from "../../components/modalv4";
import CameraCapture from "../../components/camera/camera-capture";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../firebase/firebase";
import { useCurrency } from "../../context/currency-provider";
import CartItems from "../../components/cart-items";

export default function ProfilePage() {
  const { user, logout } = useUser();
  const [userData, setUserData] = useState<any>(null);
  const [profilePageState, setProfilePageState] = useState<string>("Profile");
  const [file, setFile] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [userFirstName, setUserFirstName] = useState<any>(null);
  const [userLastName, setUserLastName] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<any>(null);
  const [userAge, setUserAge] = useState<any>(null);
  const [userGender, setUserGender] = useState<any>(null);
  const [userIsSubscribed, setUserIsSubscribed] = useState<any>(null);

  const [cardHolderName, setCardHolderName] = useState<any>(null);
  const [cardNumber, setCardNumber] = useState<any>(null);
  const [expirationMonth, setExpirationMonth] = useState<any>(null);
  const [expirationYear, setExpirationYear] = useState<any>(null);
  const [cardCvv, setCardCvv] = useState<any>(null);
  const [cardErrorText, setCardErrorText] = useState<string>("");
  const [cardSuccessText, setCardSuccessText] = useState<string>("");
  const [modalCardOpen, setModalCardOpen] = useState(false);
  const [cards, setCards] = useState<any>(null);

  const [modalBankOpen, setModalBankOpen] = useState(false);
  const [bankId, setBankId] = useState<any>(1);
  const [bankAccountNumber, setBankAccountNumber] = useState<any>(null);
  const [bankPicture, setBankPicture] = useState<any>(null);
  const [bankErrorText, setBankErrorText] = useState<any>(null);
  const [bankSuccessText, setBankSuccessText] = useState<any>(null);
  const [userBanks, setUserBanks] = useState<any>(null);

  const [topupAmount, setTopupAmount] = useState<any>(null);
  const [topupErrorText, setTopupErrorText] = useState<any>(null);

  const [bank, setBanks] = useState<any>(null);
  const [ticket, setTickets] = useState<any>(null);
  const [shownTicket, setShownTicket] = useState<any>(null);

  const [flightSelected, setFlightSelected] = useState<any>(true);
  const [hotelSelected, setHotelSelected] = useState<any>(true);

  const { toString } = useCurrency();

  const toggleCardModal = () => {
    setModalCardOpen(!modalCardOpen);
  };

  const toggleBankModal = () => {
    setModalBankOpen(!modalBankOpen);
  };

  const ticketFilter = (e: any) => {
    console.log(e.Cart.FlightReservationId)
    console.log(flightSelected)
    if (flightSelected === false && e.Cart.FlightReservationId !== null) {
        return false;
    }
    if (hotelSelected === false && e.Cart.HotelReservationId !== null) {
        return false;
    }
    return true; 
}

  useEffect(() => {
    if (ticket){
      let data = ticket.filter(ticketFilter)
      setShownTicket(data)
    }
  },[flightSelected,hotelSelected])

  function cartCheck(cartIsPaid: boolean, cartEnded: boolean, object: any) {
    if (cartIsPaid && cartEnded) return <></>;
    else return object;
  }
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
        setTickets(data);
        setShownTicket(data);
        console.log(data);
        // for (const d of data) {
        //   console.log(new Date(d.Cart.ExpiredAt));
        // }

        // console.log(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } else {
      navigate("/login");
    }
  };

  const handleTopUpUser = async () => {
    if (user) {
      // if (typeof topupAmount === "number") {

      const response = await fetch("http://localhost:3000/api/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.Id,
          money: parseInt(topupAmount, 10),
        }),
      });

      const data = await response.json();
      await fetchUserData();
      console.log(data);
      // } else {
      //   setTopupErrorText("Please enter a valid amount");
      // }
    }
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const cameraCaptureRef = useRef<any>(null);
  const handleCapture = (imageData: string) => {
    console.log("Received imageData:", imageData);

    // Remove data URL prefix
    const base64String = imageData.replace(/^data:image\/jpeg;base64,/, "");

    // Handle special characters
    const decodedString = atob(decodeURIComponent(base64String));

    // Convert the decoded string to a Uint8Array
    const byteCharacters = decodedString;
    const byteArrays = new Uint8Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays[i] = byteCharacters.charCodeAt(i);
    }

    // Create a Blob from the Uint8Array
    const blob = new Blob([byteArrays], { type: "image/jpeg" });

    // Set the Blob as the file state
    setFile(blob);

    // Create a URL for the Blob
    const imageUrl = URL.createObjectURL(blob);

    // Set the image preview URL
    setImagePreview(imageUrl);

    console.log(blob);
    console.log(imageUrl);
  };

  const navigate = useNavigate();

  const updateUserData = async () => {
    if (user && userData) {
      let imageUrl: string | undefined;
      if (file) {
        const profilePicRef = ref(storage, `profile-picture/${userEmail}.jpg`);
        await uploadBytes(profilePicRef, file).then((snapshot) => {
          console.log("Uploaded a blob or file!");
        });

        try {
          const downloadURL = await getDownloadURL(profilePicRef);
          imageUrl = downloadURL;
        } catch (error) {
          console.error("Error getting download URL:", error);
        }
      }

      const response = await fetch("http://localhost:3000/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: parseInt(userData.ID),
          first_name: userFirstName,
          last_name: userLastName,
          email: userEmail,
          age: parseInt(userAge),
          gender: userGender,
          is_subscribed: userIsSubscribed,
          profile_picture_path: imageUrl,
        }),
      });
      const data = await response.json();
      console.log(data);

      if (response.ok) fetchUserData();
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

  const fetchUserBankingDetails = async () => {
    if (user) {
      const response = await fetch(
        `http://localhost:3000/api/bank/user/${user.Id}`
      );
      const data = await response.json();
      console.log(data);
      if (response.ok) setUserBanks(data);
    }
  };

  const handleBankingSubmission = async () => {
    if (user) {
      if (!bankAccountNumber) {
        console.log(bankAccountNumber);
        setBankErrorText("Bank Account Number is required");
        return;
      } else {
        setBankErrorText("");
        console.log(bankId);
        const response = await fetch(
          `http://localhost:3000/api/bankingDetails/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: user.Id,
              bank_id: parseInt(bankId),
              account_number: bankAccountNumber,
            }),
          }
        );
        const data = await response.json();

        if (!response.ok) {
          setBankErrorText(data.message);
        } else {
          setBankErrorText("");
          setBankSuccessText("Success adding bank details");

          setTimeout(() => {
            setModalBankOpen(false);
            setBankAccountNumber(null);
            setBankId(0);
          }, 700);
        }
      }
    }
  };

  const fetchBankData = async () => {
    const response = await fetch(`http://localhost:3000/api/bank/all`);
    const data = await response.json();
    if (response.ok) setBanks(data);
    console.log(data);
  };

  useEffect(() => {
    fetchCardData();
  }, [user, modalCardOpen]);

  useEffect(() => {
    fetchBankData();
    fetchUserBankingDetails();
  }, [user, modalBankOpen]);

  useEffect(() => {
    async () => {
      if (userData) {
        setUserFirstName(userData.FirstName);
        setUserLastName(userData.LastName);
        setUserEmail(userData.Email);
        setUserAge(userData.Age);
        setUserGender(userData.Gender);
        setUserIsSubscribed(userData.IsSubscribeToNewsLetter);
      }
    };
  }, [userData]);

  const handleCardSubmission = async () => {
    if (
      !cardHolderName ||
      !cardNumber ||
      !expirationMonth ||
      !expirationYear ||
      !cardCvv
    ) {
      setCardErrorText("Please fill in all fields");
      return;
    }

    console.log(
      cardHolderName,
      cardNumber,
      expirationMonth,
      expirationYear,
      cardCvv
    );

    if (user) {
      const response = await fetch(
        `http://localhost:3000/api/creditCard/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.Id,
            card_holder: cardHolderName,
            card_number: cardNumber,
            card_expiry_month: parseInt(expirationMonth),
            card_expiry_year: parseInt(expirationYear),
            card_cvv: cardCvv,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setCardErrorText(data.message);
      } else {
        setCardErrorText("");
        setCardSuccessText("Success creating card");
        setTimeout(() => {
          setModalCardOpen(false);
          setCardSuccessText("");
          setCardCvv(null);
          setCardNumber(null);
          setCardHolderName(null);
          setExpirationMonth(null);
          setExpirationYear(null);
        }, 700);
      }
    }
  };

  const fetchUserData = async () => {
    if (user) {
      const response = await fetch(
        `http://localhost:3000/api/user/${user.Id}`,
        { method: "GET" }
      );
      const data = await response.json();
      console.log(data);
      if (response.ok) setUserData(data);
      // else navigate("/login");
    }

    // else navigate("/login");
  };

  useEffect(() => {
    (async () => {
      fetchUserData();
      fetchData();
    })();
  }, [user]);

  const pageState: any = {
    Profile: {
      body: (
        <>
          {userData && (
            <>
              <div className="profile-picture-page">
                <div
                  style={{ display: "flex", gap: "20px", alignItems: "center" }}
                >
                  <img
                    style={{ marginBottom: "14px" }}
                    src={
                      imagePreview ? imagePreview : userData.ProfilePicturePath
                    }
                    alt=""
                  />

                  <label htmlFor="fileInput">
                    <span
                      style={{ position: "relative", top: "3px" }}
                      className="material-symbols-outlined"
                    >
                      photo_library
                    </span>
                  </label>
                  <input
                    type="file"
                    id="fileInput"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                  <CameraCapture
                    onCapture={handleCapture}
                    ref={cameraCaptureRef}
                  ></CameraCapture>
                </div>

                <div className="profile-picture-update">
                  <div></div>
                  <TextField
                    label="First Name"
                    value={userFirstName}
                    onchange={(e) => setUserFirstName(e.target.value)}
                    name="FirstName"
                  ></TextField>
                  <TextField
                    label="Last Name"
                    value={userLastName}
                    name="LastName"
                    onchange={(e) => setUserLastName(e.target.value)}
                  ></TextField>

                  <TextField
                    label="Email"
                    value={userEmail}
                    name="Email"
                    onchange={(e) => setUserEmail(e.target.value)}
                  ></TextField>

                  <TextField
                    label="Age"
                    value={userAge}
                    onchange={(e) => setUserAge(e.target.value)}
                    name="Age"
                  ></TextField>

                  <div className="checkbox-group">
                    <label>
                      <input
                        onChange={(e) => setUserIsSubscribed(e.target.checked)}
                        type="checkbox"
                        name="subscribe"
                        checked={userIsSubscribed}
                      />{" "}
                      Subscribe to Newsletter
                    </label>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    updateUserData();
                  }}
                  type={ButtonType.PRIMARY}
                  text="Save Changes"
                ></Button>
              </div>
            </>
          )}
        </>
      ),
      method: () => {
        setProfilePageState("Profile");
      },
      icon: <span className="material-symbols-outlined">person</span>,
    },
    "My Points": {
      body: <></>,
      method: () => {
        setProfilePageState("My Points");
      },
      icon: <span className="material-symbols-outlined">monetization_on</span>,
    },
    "HI Wallet": {
      body: (
        <>
          <div className="card-profile-page">
            <h2>HI Wallet</h2>
            <div className="my-wallet">
              <span className="material-symbols-outlined">wallet</span>
              {toString(userData && userData.WalletBalance)}
            </div>
            <div className="topup-btn">
              <TextField
                onchange={(e) => setTopupAmount(e.target.value)}
                name=""
                label="Top Up Amount"
              ></TextField>
              <Button
                onClick={() => handleTopUpUser()}
                type={ButtonType.PRIMARY}
                text="Top Up"
              ></Button>
            </div>
          </div>
        </>
      ),
      method: () => {
        setProfilePageState("HI Wallet");
      },
      icon: <span className="material-symbols-outlined">wallet</span>,
    },
    "My Cards": {
      body: (
        <>
          <div className="card-profile-page">
            <h2 style={{ marginTop: "30px" }}>My Cards</h2>
            <div className="list-of-cards">
              {cards &&
                cards.map((card: any) => {
                  return (
                    <>
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
                    </>
                  );
                })}
              {/* <CreditCard></CreditCard> */}
            </div>

            <div className="add-card-card">
              <Modalv4
                toggleModal={toggleCardModal}
                isOpen={modalCardOpen}
                onClose={() => setModalCardOpen(false)}
                children={
                  <>
                    <div className="add-card-modal">
                      <h2>Add Card</h2>
                      <div style={{ marginLeft: "10%" }}>
                        <CreditCard
                          digits={cardNumber}
                          name={cardHolderName}
                          expirationMonth={expirationMonth}
                          expirationYear={expirationYear}
                        ></CreditCard>
                      </div>
                      <TextField
                        name="Name"
                        type="text"
                        onchange={(e) => {
                          setCardHolderName(e.target.value);
                        }}
                        label="Name"
                        value={cardHolderName}
                      ></TextField>
                      <TextField
                        name="Digits"
                        type="number"
                        onchange={(e) => {
                          // Limit input to 16 digits
                          if (e.target.value.length <= 16) {
                            setCardNumber(e.target.value);
                          }
                        }}
                        label="16 Digits"
                        value={cardNumber}
                      ></TextField>

                      <div style={{ display: "flex" }}>
                        <TextField
                          name="ExpireMonth"
                          type="number"
                          onchange={(e) => {
                            if (e.target.value.length <= 2) {
                              setExpirationMonth(e.target.value);
                            }
                          }}
                          label="Month"
                          value={expirationMonth}
                        ></TextField>

                        <TextField
                          name="ExpireYear"
                          type="number"
                          onchange={(e) => {
                            if (e.target.value.length <= 2) {
                              setExpirationYear(e.target.value);
                            }
                          }}
                          label="Year"
                          value={expirationYear}
                        ></TextField>
                      </div>
                      <TextField
                        name="Cvv"
                        type="number"
                        onchange={(e) => {
                          if (e.target.value.length <= 3) {
                            setCardCvv(e.target.value);
                          }
                        }}
                        label="CVV"
                        value={cardCvv}
                      ></TextField>
                      {/* <p style={{ color: "red" }}>{cardErrorText}</p> */}
                      <p style={{ color: "green" }}>{cardSuccessText}</p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <p style={{ color: "red" }}>{cardErrorText}</p>
                        <Button
                          onClick={() => handleCardSubmission()}
                          type={ButtonType.PRIMARY}
                          text="Add Card"
                        ></Button>
                      </div>
                    </div>
                  </>
                }
                div={
                  <>
                    <div className="add-card-object">
                      <span className="material-symbols-outlined">
                        add_circle
                      </span>
                      <p>Add Card</p>
                    </div>
                  </>
                }
              ></Modalv4>
            </div>
            <h2>My Banking Details</h2>

            <div className="banking-page">
              <div style={{ padding: "10px 0" }}>
                <div className="paper">
                  {userBanks &&
                    userBanks.map((bank: any) => {
                      return (
                        <>
                          <div
                            style={{
                              display: "flex",
                              gap: "20px",
                              alignItems: "center",
                            }}
                          >
                            <img
                              style={{ width: "80px", scale: ".8" }}
                              src={bank.Bank.BankPicturePath}
                              alt=""
                            />
                            <h2>
                              {bank.Bank.Name} - {bank.AccountNumber}
                            </h2>
                          </div>
                        </>
                      );
                    })}
                </div>
              </div>
              <Modalv4
                toggleModal={toggleBankModal}
                isOpen={modalBankOpen}
                onClose={() => setModalBankOpen(false)}
                children={
                  <>
                    <div className="add-bank-modal">
                      <h2>Add Banking Details</h2>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <TextField
                          name="AccountNumber"
                          type="number"
                          onchange={(e) => {
                            if (e.target.value.length <= 12) {
                              setBankAccountNumber(e.target.value);
                            }
                          }}
                          label="Account Number"
                          value={bankAccountNumber}
                        ></TextField>

                        <div
                          className="select-bank"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "start",
                            width: "40%",
                          }}
                        >
                          <label htmlFor="">Bank</label>
                          <select
                            value={bankId}
                            onChange={(e) => setBankId(e.target.value)}
                            style={{
                              width: "100%",
                              height: "43%",
                              padding: "8px",
                              outline: "none",
                              background: "transparent",
                            }}
                          >
                            {bank &&
                              bank.map((bank: any) => (
                                <option
                                  key={bank.ID}
                                  value={bank.ID}
                                  data-thumbnail={bank.BankPicturePath}
                                >
                                  <div
                                    className="option-bank"
                                    style={{ display: "flex", gap: "20px" }}
                                  >
                                    <img src={bank.BankPicturePath} alt="" />
                                    {bank.Name}
                                  </div>
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <p style={{ color: "red" }}>{bankErrorText}</p>
                      <p style={{ color: "green" }}>{bankSuccessText}</p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        {/* <p style={{ color: "red" }}>{cardErrorText}</p> */}
                        <Button
                          onClick={() => handleBankingSubmission()}
                          type={ButtonType.PRIMARY}
                          text="Add Banking Details"
                        ></Button>
                      </div>
                    </div>
                  </>
                }
                div={
                  <>
                    <div
                      style={{ marginTop: "20px" }}
                      className="add-banking-detail-object"
                    >
                      <span className="material-symbols-outlined">
                        add_circle
                      </span>
                      <p>Add Banking Detail</p>
                    </div>
                  </>
                }
              ></Modalv4>
            </div>
          </div>
        </>
      ),
      method: () => {
        setProfilePageState("My Cards");
      },
      icon: <span className="material-symbols-outlined">credit_card</span>,
    },
    "My Orders": {
      body: (
        <>
          <div className="order-page">
            <h2 style={{ marginBottom: "20px" }}>Ongoing Tickets</h2>

            <div style={{ display: "flex", alignItems: "center" }}>
              <h3>Flight</h3>
              <input
                type="checkbox"
                checked={flightSelected} 
                onChange={(e) => setFlightSelected(e.target.checked)} 
              />
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <h3>Hotel</h3>
              <input
                type="checkbox"
                checked={hotelSelected}
                onChange={(e) => setHotelSelected(e.target.checked)} 
              />
            </div>

            {ticket && <CartItems carts={shownTicket}></CartItems>}
          </div>
        </>
      ),
      method: () => {
        setProfilePageState("My Orders");
      },
      icon: <span className="material-symbols-outlined">receipt_long</span>,
    },
    "Payment History": {
      body: <></>,
      method: () => {
        setProfilePageState("Payment History");
      },
      icon: <span className="material-symbols-outlined">history</span>,
    },
    "My Promos": {
      body: <></>,
      method: () => {
        setProfilePageState("My Promos");
      },
      icon: <span className="material-symbols-outlined">percent</span>,
    },
    Logout: {
      icon: <span className="material-symbols-outlined">logout</span>,
      method: () => {
        logout();
      },
    },
  };

  return (
    <>
      <div className="middleize nav-pad">
        <div className="profile-frame">
          <div className="profile-selection paper-np">
            {userData && (
              <div className="prof-pic-frame">
                <div className="img-frame">
                  <img src={userData.ProfilePicturePath} alt="" />
                </div>

                <div className="prof-desc-frame">
                  <p style={{ fontWeight: "bold" }}>
                    {userData.FirstName} {userData.LastName}
                  </p>
                </div>

                {/* <p>{userData.Email}</p> */}
                {/* <div style={{backgroundColor:'yellow'}}>
                </div>
                  <div >
                  </div> */}
              </div>
            )}
            <hr
              style={{
                margin: "14px 0",
                color: "black",
                width: "100%",
                border: "1px solid lightgrey",
              }}
            />
            {Object.keys(pageState).map((stateKey) => (
              <button
                className={`${
                  profilePageState === stateKey
                    ? "profile-btns-select"
                    : "profile-btns"
                }`}
                key={stateKey}
                onClick={pageState[stateKey].method}
              >
                {pageState[stateKey].icon}
                {stateKey}
              </button>
            ))}
          </div>
          <div style={{ overflowY: "auto" }} className="profile-body paper">
            {/* <div style={{width:'100%',height:'100%', backgroundColor:'blue'}}></div> */}
            {pageState[profilePageState].body}
          </div>
        </div>
      </div>
    </>
  );
}
