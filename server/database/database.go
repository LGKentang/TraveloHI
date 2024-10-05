package database

import (
	"fmt"
	"time"

	"github.com/darren/travelohi/models"
	"github.com/go-faker/faker/v4"
	"gorm.io/datatypes"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"github.com/lib/pq"
)

var DB *gorm.DB

func Connect() {
	dbUsername := "postgres"
	dbPassword := "root"
	dbName := "travelohi"
	connStr := fmt.Sprintf("host=localhost user=%s database=%s password=%s sslmode=disable", dbUsername, dbName, dbPassword)
	connection, err := gorm.Open(postgres.Open(connStr), &gorm.Config{})

	if err != nil {
		panic(err)
	}
	DB = connection
}

type PromoListener struct {
    db           *gorm.DB
    notification chan string
    listener     *pq.Listener
}

// NewPromoListener creates a new instance of PromoListener and starts listening for notifications
func NewPromoListener(db *gorm.DB) *PromoListener {
    connStr := "postgresql://user:password@localhost/dbname?sslmode=disable"

    listener := pq.NewListener(connStr, 10*time.Second, time.Minute, func(ev pq.ListenerEventType, err error) {
        if err != nil {
            // Handle error
        }
    })


    err := listener.Listen("promo_updates")
    if err != nil {

    }

    promoListener := &PromoListener{
        db:           db,
        notification: make(chan string),
        listener:     listener,
    }

    go promoListener.listenForNotifications()

    return promoListener
}

// Close stops the listener and cleans up resources
func (pl *PromoListener) Close() {
    pl.listener.UnlistenAll()
    pl.listener.Close()
}

// listenForNotifications continuously listens for PostgreSQL notifications and sends them to the notification channel
func (pl *PromoListener) listenForNotifications() {
    for {
        select {
        case n := <-pl.listener.Notify:
            // Send notification payload to the channel
            pl.notification <- n.Extra
        }
    }
}

func SyncDatabase() {
	DB.AutoMigrate(&models.User{})
	DB.AutoMigrate(&models.Otp{})
	DB.AutoMigrate(&models.Promo{})
	DB.AutoMigrate(&models.SecurityQuestion{})
	DB.AutoMigrate(&models.CreditCard{})
	DB.AutoMigrate(&models.CreditCardUser{})
	DB.AutoMigrate(&models.Room{})
	// DB.AutoMigrate(&models.Facilities{})
	// DB.AutoMigrate(&models.HotelFacilities{})
	DB.AutoMigrate(&models.CreditCard{})
	DB.AutoMigrate(&models.Hotel{})
	DB.AutoMigrate(&models.Review{})
	DB.AutoMigrate(&models.HotelReservation{})
	DB.AutoMigrate(&models.Airport{})
	DB.AutoMigrate(&models.Airplane{})
	DB.AutoMigrate(&models.FlightClass{})
	DB.AutoMigrate(&models.FlightSeats{})
	DB.AutoMigrate(&models.Flight{})
	DB.AutoMigrate(&models.FlightScheduleSegment{})
	DB.AutoMigrate(&models.FlightSchedule{})
	DB.AutoMigrate(&models.FlightReservation{})
	DB.AutoMigrate(&models.TransactionDetail{})
	DB.AutoMigrate(&models.TransactionHeader{})
	DB.AutoMigrate(&models.ReservationCart{})
	DB.AutoMigrate(&models.Coupon{})
	DB.AutoMigrate(&models.SearchHistory{})
	DB.AutoMigrate(&models.Bank{})
	DB.AutoMigrate(&models.BankingUser{})
}

func FakeData() {
	CreatePromo()
	CreateHotel()
	CreateRoomAndFacilities()
	CreateFlight()
	CreateBanks()
}

func FakeSpecificData() {
}

func CreateRoomAndFacilities() {
	room_types := []string{
		"Standard",
		"Standard",
		"Deluxe",
		"Deluxe",
		"Family",
		"Executive",
		"Executive",
		"Executive",
	}

	room_multipliers := []float32{
		1,
		1,
		2.13,
		3.4,
		3.5,
		4.0,
		4.5,
		5.0,
	}

	// room_picturesJSON := []string{

	// }

	room_facilitiesJSON := []datatypes.JSON{
		datatypes.JSON([]byte(`[
			"AC", "WiFi", "Breakfast", "Swimming Pool", "Gym"
		  ]`)),
		datatypes.JSON([]byte(`[
			"AC", "WiFi", "Breakfast", "Swimming Pool", "Gym"
		  ]`)),
		datatypes.JSON([]byte(`[
			"AC", "WiFi", "Breakfast", "Swimming Pool", "Gym"
		  ]`)),
		datatypes.JSON([]byte(`[
			"AC", "WiFi", "Breakfast", "Swimming Pool", "Gym","Spa"
		  ]`)),
		datatypes.JSON([]byte(`[
			"AC", "WiFi", "Breakfast", "Swimming Pool", "Gym", "Spa", "Jaccuzi"
		  ]`)),
		datatypes.JSON([]byte(`[
			"AC", "WiFi", "Breakfast", "Swimming Pool", "Gym","Spa","Jaccuzi","Sauna","Massage Room"
		  ]`)),
		datatypes.JSON([]byte(`[
			"AC", "WiFi", "Breakfast", "Swimming Pool", "Gym","Spa","Jaccuzi","Sauna","Massage Room","Private Chef"
		  ]`)),
		datatypes.JSON([]byte(`[
			"AC", "WiFi", "Breakfast", "Swimming Pool", "Gym","Spa","Jaccuzi","Sauna","Massage Room","Private Chef"
		  ]`)),
	}

	hotelIds := []uint{
		1, 2, 1, 2, 3, 4, 5, 6,
	}

	for i := 0; i < 8; i++ {
		room := models.Room{
			Type:           room_types[i],
			BaseMultiplier: room_multipliers[i],
			FacilitiesJSON: room_facilitiesJSON[i],
			HotelId:        hotelIds[i],
		}

		DB.Create(&room)
	}

	// facilities := []string{
	// 	"AC",
	// 	"WiFi",
	// 	"Restaurant",
	// 	"Swimming Pool",
	// 	"24-Hour Front Desk",
	// 	"Parking",
	// 	"Elevator",
	// 	"Gym",
	// 	"Spa",
	// 	"Conference Rooms",
	// 	"Room Service",
	// 	"Laundry Service",
	// 	"Pet-Friendly",
	// 	"Business Center",
	// 	"Kids Club",
	// 	"Bar/Lounge",
	// }

	// for i, f := range facilities {
	// 	fmt.Println(i)
	// 	facility := models.Facilities{
	// 		Name: f,
	// 	}
	// 	DB.Create(&facility)
	// }

	// var hotelIds = []uint{
	// 	1,1,1,1,2,2,3,3,4,5,5,5,5,6,6,6,
	// }

	// var facilitiesId = []uint{
	// 	1,2,3,4,1,2,1,2,3,4,5,3,2,4,6,7,
	// }

	// var roomsId = []uint{
	// 	1,2,3,4,1,2,1,3,1,1,2,3,4,1,2,3,
	// }

	// for i := 0; i < len(hotelIds); i++ {
	// 	DB.Create(&models.HotelFacilities{
	// 		HotelId:    hotelIds[i],
	// 		FacilityId: facilitiesId[i],
	// 		RoomId:     roomsId[i],
	// 	})
	// }

}

func CreatePromo() {
	percentage := []*float32{
		new(float32), // Set to 0.7
		nil,          // Represents absence of value
		nil,          // Represents absence of value
		nil,          // Represents absence of value
	}
	*percentage[0] = 0.7

	promo_type := []string{
		"Percentage",
		"Amount",
		"Amount",
		"Amount",
	}

	promo_name := []string{
		"Hotel",
		"Hotel",
		"Hotel",
		"Flight",
	}

	promo_value := []*int32{
		nil,
		new(int32),
		new(int32),
		new(int32),
	}

	*(promo_value[1]) = 350000
	*(promo_value[2]) = 1300000
	*(promo_value[3]) = 150000

	promo_image_path := []string{
		"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/promo%2F1.jpg?alt=media&token=e145ef01-67b7-4828-a240-d0b6c6313e22",
		"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/promo%2F2.jpg?alt=media&token=40974963-c924-4d63-816e-96b9058c07e1",
		"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/promo%2F3.jpg?alt=media&token=e97ab7b7-7655-47fd-bf55-d96d9ce5bc56",
		"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/promo%2F4.jpg?alt=media&token=d3c26958-3d36-4053-9b97-4cd164777a78",
	}

	for i := 0; i < 4; i++ {
		promo := models.Promo{
			Percentage: percentage[i],
			Type:       promo_type[i],
			Title:      promo_name[i],
			Value:      promo_value[i],
			ImagePath:  promo_image_path[i],
		}
		DB.Create(&promo)
	}
}

func CreateUser() {
	user := models.User{}
	err := faker.FakeData(&user)
	if err != nil {
		fmt.Println(err)
	}
	DB.Create(&user)

}

func CreateHotel() {
	hotel_names := []string{
		"Grand Asrilia Hotel Convention & Restaurant",
		"Outer Row Hotel",
		"Oceanfront Resort",
		"The Anvaya Beach Resort Bali",
		"Luxury Heights Hotel",
		"Mountain Retreat Lodge",
	}

	hotel_rating := []float32{
		4.6,
		4.1,
		4.8,
		4.9,
		4.5,
		4.3,
	}

	hotel_star := []int{
		4,
		4,
		5,
		5,
		4,
		4,
	}

	hotel_descriptions := []string{
		`Discover unparalleled luxury at the Grand Asrilia Hotel Convention & Restaurant, where modern elegance meets timeless hospitality. Immerse yourself in a world of sophistication, where every detail is meticulously crafted to ensure an extraordinary stay. From lavish accommodations to exquisite dining experiences, our hotel is a haven of comfort and style. Whether you're here for business or leisure, embrace the epitome of grandeur at Grand Asrilia – where your every moment is elevated into a memorable experience.`,
		`Welcome to Outer Row Hotel, where simplicity meets serenity. Unwind in a cozy retreat, where each corner exudes warmth and comfort. Our hotel is a sanctuary for those seeking a peaceful escape, offering a blend of modern amenities and a touch of tranquility. Immerse yourself in the inviting ambiance and discover a haven that feels like home away from home. At Outer Row Hotel, we redefine relaxation, making every stay a memorable and rejuvenating experience`,
		"Escape to Oceanfront Resort, where breathtaking views and luxurious amenities await. Our resort is a paradise by the sea, offering an idyllic retreat for those seeking tranquility and beauty. Immerse yourself in the soothing sounds of the ocean and unwind in elegant accommodations. Oceanfront Resort is more than a destination; it's an experience of serenity and coastal luxury.",
		"From business event to corporate gathering, The Anvaya Beach Resort Bali provides complete services and facilities that you and your colleagues need. This resort is the best spot for you who desire a serene and peaceful getaway, far away from the crowds.The highest quality service accompanying its extensive facilities will make you get the ultimate holiday experience.",
		"Luxury Heights Hotel combines opulence with modern comfort. Indulge in sophisticated elegance as you experience our luxurious accommodations and personalized service. From high-end amenities to exclusive dining options, every aspect of your stay is crafted for an exceptional experience. Elevate your senses at Luxury Heights Hotel, where luxury knows no bounds.",
		"Experience the serenity of nature at Mountain Retreat Lodge. Nestled amidst breathtaking landscapes, our lodge provides a peaceful escape from the hustle and bustle of city life. Immerse yourself in the beauty of the mountains and enjoy cozy accommodations. Mountain Retreat Lodge is a haven for nature enthusiasts, providing a perfect blend of comfort and tranquility.",
	}

	hotel_picturePathJSON := []datatypes.JSON{
		datatypes.JSON([]byte(`[
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F1%2F1.jpg?alt=media&token=bc172db5-4f3f-41ea-b0eb-2eafae446c49",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F1%2F2.jpg?alt=media&token=7cb9fc85-10c2-43a1-8298-fc58a362ea33",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F1%2F3.jpg?alt=media&token=c0775010-6dfe-45e7-9d22-b590fe7abe48",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F1%2F4.jpg?alt=media&token=e93a1873-fa24-4d07-a16d-367b8a46ae27",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F1%2F5.jpg?alt=media&token=e16da2fd-0aab-4f72-a1d0-31fee43b929d"
		  ]`)),

		datatypes.JSON([]byte(`[
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F2%2F1.jpg?alt=media&token=c657c27e-2bbb-4cfa-88ec-c2fd966dda73",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F2%2F2.jpg?alt=media&token=f036da32-612a-44e8-967e-0c641ba9e859",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F2%2F3.jpg?alt=media&token=680e1f0a-e720-4a7c-b410-efc44eb16dbc",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F2%2F4.jpg?alt=media&token=c3f9f8fe-075a-479d-a26e-2f0d48a5caf1",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F2%2F5.jpg?alt=media&token=c6270059-fc49-4b10-82e5-1842eba16a8e",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F2%2F6.jpg?alt=media&token=03ffe90a-dec7-4b32-91ac-f1e21e34792b"
		]`)),

		datatypes.JSON([]byte(`[
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F3%2F1.jpg?alt=media&token=f4ae5051-df64-4bc0-b1b9-9d2894a41602",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F3%2F2.jpg?alt=media&token=5c19b874-9112-41ef-889e-3b8536e890e2",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F3%2F3.jpg?alt=media&token=ffa02657-e4a7-4f88-9931-1114f6c7a841",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F3%2F4.jpg?alt=media&token=4cf1f004-592f-4fe0-8430-247721d574a3",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F3%2F5.jpg?alt=media&token=ad5a9a60-b494-41e5-ada5-e22f78dcaa0b"
		]`)),

		datatypes.JSON([]byte(`[
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F4%2F1.jpg?alt=media&token=349aa67c-b759-456f-a66b-dcfede5082ff",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F4%2F2.jpg?alt=media&token=abaa142d-5e6a-4884-85d8-e9aaa7d3aea2",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F4%2F3.jpg?alt=media&token=66056f5a-8fcf-4571-8e07-ee4fa23dd8e4",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F4%2F4.jpg?alt=media&token=bc8c14bf-59f4-44de-ad47-0873c30d3f18",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F4%2F5.jpg?alt=media&token=5829f0f5-43cb-4fb1-a927-fd18751d81af",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F4%2F6.jpg?alt=media&token=0d944126-9672-44a8-9eeb-6ceba0d80661"
		]`)),

		datatypes.JSON([]byte(`[
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F5%2F1.jpg?alt=media&token=285bddcd-342b-4ce8-8deb-954f4fe6838c",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F5%2F2.jpg?alt=media&token=06033e5c-37f6-4a1c-a028-6bbd07067019",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F5%2F4.jpg?alt=media&token=b0983a5a-409d-46cc-b80d-ee21861cd601",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F5%2F5.jpg?alt=media&token=66fe59a6-fe2f-49f1-bfb7-789c0090dbce"
		]`)),

		datatypes.JSON([]byte(`[
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F6%2F1.jpg?alt=media&token=87598ed2-e1cb-4cbd-a121-1bcfea7fcd3c",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F6%2F2.jpg?alt=media&token=8d41a497-a781-4f42-8ea7-e991348a5972",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F6%2F3.jpg?alt=media&token=d41d54f4-1a83-4b35-a464-3a40b4ea1438",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F6%2F4.jpg?alt=media&token=5a3ead6e-456e-4d77-aa24-997982d27b7d",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F6%2F5.jpg?alt=media&token=348ea47c-8168-4213-8959-c8ce706c68cd",
			"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F6%2F6.jpg?alt=media&token=35897a9e-2e4f-4069-b3f3-5480a4731557"
		]`)),
	}

	hotel_address := []string{
		"Jl. Pelajar Pejuang 45 No.123, Turangga, Kec. Lengkong, Kota Bandung, Jawa Barat, Indonesia 40264",
		"Rua Trinta e Seis 495, Cabo De Santo Agostinho, Pernambuco, 54505-495, Brazil",
		"Oceanfront Paradise, Coastal Area, CA, United States",
		"Jalan Kartika Plaza, Kuta, Badung, Bali, Indonesia, 80361",
		"Luxury Heights Avenue, Prestige District, NY, United States",
		"Mountain View Drive, Serene Valley, CA, United States",
	}

	hotel_main_image_path := []string{
		"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F1.jpg?alt=media&token=cb69d567-bce6-4831-82d9-99386e756055",
		"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F2.jpg?alt=media&token=e86d8f98-508d-4aa9-b72f-81700a3e7bfa",
		"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F3.jpg?alt=media&token=f677ebc1-01ed-446d-aa50-788b62b3d264",
		"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F4.jpg?alt=media&token=d779b2f7-8533-42cd-941b-edda06c49fc3",
		"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F5.jpg?alt=media&token=1a3dae12-11c5-46e3-a94f-d905b8289347",
		"https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/hotel%2F6.jpg?alt=media&token=aa525a69-32bf-49e9-b4d1-a2ea98cd60c9",
	}

	hotel_base_price := []float32{
		2490000,
		1540000,
		1980000,
		3150000,
		2890000,
		1750000,
	}

	hotel_main_facilitiesJSON := []datatypes.JSON{
		datatypes.JSON([]byte(`["AC","Gym","WiFi","Swimming Pool","Bar"]`)),
		datatypes.JSON([]byte(`["AC","Gym","WiFi","Swimming Pool","Parking"]`)),
		datatypes.JSON([]byte(`["AC","Gym","WiFi","Swimming Pool","Parking"]`)),
		datatypes.JSON([]byte(`["AC","WiFi","Swimming Pool","Bar"]`)),
		datatypes.JSON([]byte(`["AC","Gym","WiFi","Swimming Pool","Parking"]`)),
		datatypes.JSON([]byte(`["AC","Gym","WiFi","Swimming Pool","Bar"]`)),
	}

	hotel_available_rooms := []uint{
		23,
		5,
		34,
		45,
		67,
		9,
	}

	for i := 0; i < 6; i++ {
		hotel := models.Hotel{
			Name:               hotel_names[i],
			Rating:             hotel_rating[i],
			Description:        hotel_descriptions[i],
			MainImagePath:      hotel_main_image_path[i],
			PicturePathJSON:    hotel_picturePathJSON[i],
			Address:            hotel_address[i],
			SearchCount:        0,
			BasePrice:          hotel_base_price[i],
			MainFacilitiesJSON: hotel_main_facilitiesJSON[i],
			Stars:              hotel_star[i],
			AvailableRooms:     hotel_available_rooms[i],
		}
		DB.Create(&hotel)
	}
}

func CreateCoupon() {
	couponClaimTexts := []string{
		"HIHIHIHIHI",
		"HItungHItung",
	}

	couponValues := []float32{
		20000,
		12345,
	}

	for i := 0; i < 2; i++ {
		coupon := models.Coupon{
			ClaimText: couponClaimTexts[i],
			Value:     couponValues[i],
		}
		DB.Create(&coupon)
	}
}

func CreateFlight() {
	// Dummy airplane data
	airplane_codes := []string{
		"A606",
		"B707",
		"C808",
		"D909",
		"E1010",
	}

	airplane_manufacturer := []string{
		"Boeing",
		"Airbus",
		"Embraer",
		"Bombardier",
		"Lockheed Martin",
	}

	airplane_seatRows := []int{
		40,
		50,
		30,
		45,
		55,
	}

	airplane_seatCols := []int{
		6,
		8,
		6,
		7,
		9,
	}

	// Dummy airport data
	airport_codes := []string{
		"PKU",
		"CGK",
		"PNK",
		"DPS",
		"SUB",
		"BTH",
		"BDO",
		"JOG",
		"UPG",
		"MDC",
		"LOP",
		"SRG",
		"SOC",
		"AMI",
		"PLM",
		"SMG",
		"BPN",
		"BTJ",
		"MKW",
	}

	airport_name := []string{
		"Sultan Syarif Kasim II International Airport",
		"Soekarno-Hatta International Airport",
		"Supadio International Airport",
		"I Gusti Ngurah Rai International Airport",
		"Juanda International Airport",
		"Hang Nadim International Airport",
		"Husein Sastranegara International Airport",
		"Adisutjipto International Airport",
		"Sultan Hasanuddin International Airport",
		"Sam Ratulangi International Airport",
		"Lombok International Airport",
		"Adi Sumarmo International Airport",
		"Adi Soemarmo International Airport",
		"Selaparang Airport",
		"Sultan Mahmud Badaruddin II International Airport",
		"Adisumarmo Airport",
		"Adisutjipto Airport",
		"Sepinggan International Airport",
		"Sultan Iskandar Muda International Airport",
	}

	airport_city := []string{
		"Pekanbaru",
		"Jakarta",
		"Pontianak",
		"Denpasar",
		"Surabaya",
		"Batam",
		"Bandung",
		"Yogyakarta",
		"Makassar",
		"Manado",
		"Lombok",
		"Surakarta",
		"Semarang",
		"Mataram",
		"Palembang",
		"Semarang",
		"Solo",
		"Yogyakarta",
		"Balikpapan",
		"Banda Aceh",
	}

	// Dummy flight class data
	flight_class_name := []string{
		"Economy",
		"Business",
		"First-Class",
	}

	// Dummy flight data
	flight_airplane_code := []string{
		"A606",
		"B707",
		"C808",
		"D909",
		"E1010",
	}

	flight_origin_code := []string{
		"PKU",
		"CGK",
		"PNK",
		"DPS",
		"SUB",
	}

	flight_destination_code := []string{
		"CGK",
		"PNK",
		"DPS",
		"SUB",
		"BTH",
	}

	flight_airline_name := []string{
		"Lion Air",
		"Garuda Indonesia",
		"Batik Air",
		"Citilink",
		"Sriwijaya Air",
	}

	flight_airline_logo := []string{
		`https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/airline-logo%2FLion-Air.png?alt=media&token=150ac664-eadd-4c66-915d-09a666a51b53`,
		`https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/airline-logo%2FGaruda-Indonesia.png?alt=media&token=2f7a315f-835d-4cad-9910-87995ac4f6ae`,
		`https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/airline-logo%2FBatik-Air.png?alt=media&token=5eff9408-fe12-4276-8817-b99ebc0d28d5`,
		`https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/airline-logo%2FCitilink.png?alt=media&token=0c8b87e2-8b72-4097-92ad-78853b07cca8`,
		`https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/airline-logo%2FSriwijaya-Air.png?alt=media&token=9aa0d277-c800-493a-993d-b157f6acccb0`,
	}

	flight_duration := []int{
		180,
		240,
		60,
		60,
		120,
	}

	flight_departure_date := []time.Time{
		time.Now().Add(time.Hour * 1),
		time.Now().Add(time.Hour * 2),
		time.Now().Add(time.Hour * 3),
		time.Now().Add(time.Hour * 4),
		time.Now().Add(time.Hour * 5),
	}

	flight_arrival_date := []time.Time{
		time.Now().Add(time.Hour * 4),
		time.Now().Add(time.Hour * 6),
		time.Now().Add(time.Hour * 4),
		time.Now().Add(time.Hour * 5),
		time.Now().Add(time.Hour * 7),
	}

	flight_base_price := []float32{
		329999,
		429999,
		249999,
		379999,
		529999,
	}

	// Dummy flight seat data
	seats_flight_id := []uint{
		1,
		2,
		3,
		4,
		5,
	}

	seats_flight_class_id := []uint{
		1,
		2,
		3,
		1,
		2,
	}

	seats_JSON := []datatypes.JSON{

		// Division should be 10/20/70
		datatypes.JSON([]byte(`["A1","A2"]`)),
		datatypes.JSON([]byte(`["B1","B2","B3"]`)),
		datatypes.JSON([]byte(`["C1","C2"]`)),
		datatypes.JSON([]byte(`["D1","D2","D3","D4"]`)),
		datatypes.JSON([]byte(`["E1","E2","E3","E4","E5"]`)),
	}

	// Dummy flight schedule data
	flight_schedule_basePrice := []uint{
		329999,
		429999,
		249999,
		379999,
		529999,
	}

	flight_schedule_baggageMaxWeight := []int{
		40,
		45,
		30,
		35,
		50,
	}

	flight_schedule_cabinMaxWeight := []int{
		20,
		25,
		15,
		18,
		30,
	}

	// Dummy flight schedule segment data
	flight_schedule_segment_flight_schedule_id := []uint{
		1,
		2,
		3,
		4,
		5,
	}

	flight_schedule_segment_flight_id := []uint{
		1,
		2,
		3,
		4,
		5,
	}

	flight_schedule_segment_segment_order := []int{
		1,
		1,
		1,
		1,
		1,
	}

	// Create airplanes
	for i := range airplane_codes {
		airplane := models.Airplane{
			AirplaneCode: airplane_codes[i],
			Manufacturer: airplane_manufacturer[i],
			SeatRows:     airplane_seatRows[i],
			SeatCols:     airplane_seatCols[i],
		}
		DB.Create(&airplane)
	}

	airplane1 := models.Airplane{
		AirplaneCode: "F003",
		Manufacturer: "Boeing",
		SeatRows:     40,
		SeatCols:     6,
	}
	DB.Create(&airplane1)

	airplane2 := models.Airplane{
		AirplaneCode: "F004",
		Manufacturer: "Boeing",
		SeatRows:     40,
		SeatCols:     6,
	}
	DB.Create(&airplane2)

	// Create airports
	for i := range airport_codes {
		airport := models.Airport{
			Code: airport_codes[i],
			Name: airport_name[i],
			City: airport_city[i],
		}
		DB.Create(&airport)
	}

	// Create flight classes
	for i := range flight_class_name {
		flightClass := models.FlightClass{
			Name: flight_class_name[i],
		}
		DB.Create(&flightClass)
	}

	// Create flight schedules
	for i := range flight_schedule_basePrice {
		flightSchedule := models.FlightSchedule{
			BasePrice:        flight_schedule_basePrice[i],
			BaggageMaxWeight: flight_schedule_baggageMaxWeight[i],
			CabinMaxWeight:   flight_schedule_cabinMaxWeight[i],
			IsTransit:        false,
		}
		DB.Create(&flightSchedule)
	}

	// Create flights
	for i := range flight_airplane_code {
		airline := models.Airline{
			Name: flight_airline_name[i],
			Logo: flight_airline_logo[i],
		}
		DB.Create(&airline)

		flight := models.Flight{
			AirplaneId:             flight_airplane_code[i],
			AirportOriginCode:      flight_origin_code[i%5],
			AirportDestinationCode: flight_destination_code[(i+1)%5],
			AirlineId:              airline.ID,
			FlightScheduleId:       uint(i + 1),
			FlightDuration:         flight_duration[i],
			FlightDepartureDate:    flight_departure_date[i],
			FlightArrivalDate:      flight_arrival_date[i],
			BasePrice:              flight_base_price[i],
			IsTransit:              false,
		}
		DB.Create(&flight)
	}

	// Create flight seats
	for i := range seats_flight_id {
		seats := models.FlightSeats{
			FlightID:      seats_flight_id[i],
			FlightClassID: seats_flight_class_id[i],
			SeatsJSON:     seats_JSON[i],
		}
		DB.Create(&seats)
	}

	// Create flight schedule segments
	for i := range flight_schedule_segment_flight_schedule_id {
		flightScheduleSegment := models.FlightScheduleSegment{
			FlightScheduleId: flight_schedule_segment_flight_schedule_id[i],
			FlightId:         flight_schedule_segment_flight_id[i],
			SegmentOrder:     flight_schedule_segment_segment_order[i],
			RestTimeMinutes:  0,
		}
		DB.Create(&flightScheduleSegment)
	}
	flightSchedule1 := models.FlightSchedule{
		BasePrice:        0,
		BaggageMaxWeight: 20,
		CabinMaxWeight:   10,
		IsTransit:        true,
	}
	DB.Create(&flightSchedule1)

	flight1 := models.Flight{
		AirplaneId:             "F003",
		AirportOriginCode:      "PKU",
		AirportDestinationCode: "CGK",
		AirlineId:              1,
		FlightScheduleId:       flightSchedule1.ID,
		FlightDuration:         120,
		FlightDepartureDate:    time.Now().Add(time.Hour * 1),
		FlightArrivalDate:      time.Now().Add(time.Hour * 3),
		BasePrice:              329999,
		IsTransit:              true,
	}

	flight2 := models.Flight{
		AirplaneId:             "F004",
		AirportOriginCode:      "CGK",
		AirportDestinationCode: "DPS",
		AirlineId:              2,
		FlightScheduleId:       flightSchedule1.ID,
		FlightDuration:         180,
		FlightDepartureDate:    time.Now().Add(time.Hour * 5),
		FlightArrivalDate:      time.Now().Add(time.Hour * 8),
		BasePrice:              829999,
	}

	DB.Create(&flight1)
	DB.Create(&flight2)

	seatJson1 := models.FlightSeats{
		FlightID:      6,
		FlightClassID: 1,
		SeatsJSON:     datatypes.JSON([]byte(`["16A","16B","16C"]`)),
	}

	seatJson2 := models.FlightSeats{
		FlightID:      7,
		FlightClassID: 2,
		SeatsJSON:     datatypes.JSON([]byte(`["17A","17B","13C"]`)),
	}

	DB.Create(&seatJson1)
	DB.Create(&seatJson2)

	flightScheduleSegment1 := models.FlightScheduleSegment{
		FlightScheduleId: flightSchedule1.ID,
		FlightId:         flight1.ID,
		SegmentOrder:     1,
		RestTimeMinutes:  120,
	}
	DB.Create(&flightScheduleSegment1)

	flightScheduleSegment2 := models.FlightScheduleSegment{
		FlightScheduleId: flightSchedule1.ID,
		FlightId:         flight2.ID,
		SegmentOrder:     2,
		RestTimeMinutes:  0,
	}
	DB.Create(&flightScheduleSegment2)

	flightSchedule2 := models.FlightSchedule{
		BasePrice:        0,
		BaggageMaxWeight: 20,
		CabinMaxWeight:   10,
		IsTransit:        true,
	}
	DB.Create(&flightSchedule2)

	flight3 := models.Flight{
		AirplaneId:             "D909",
		AirportOriginCode:      "PNK",
		AirportDestinationCode: "DPS",
		AirlineId:              1,
		FlightScheduleId:       flightSchedule2.ID,
		FlightDuration:         120,
		FlightDepartureDate:    time.Now().Add(time.Hour * 1),
		FlightArrivalDate:      time.Now().Add(time.Hour * 3),
		BasePrice:              329999,
		IsTransit:              true,
	}

	flight4 := models.Flight{
		AirplaneId:             "F004",
		AirportOriginCode:      "DPS",
		AirportDestinationCode: "CGK",
		AirlineId:              2,
		FlightScheduleId:       flightSchedule2.ID,
		FlightDuration:         180,
		FlightDepartureDate:    time.Now().Add(time.Hour * 5),
		FlightArrivalDate:      time.Now().Add(time.Hour * 8),
		BasePrice:              629999,
	}

	flight5 := models.Flight{
		AirplaneId:             "F004",
		AirportOriginCode:      "CGK",
		AirportDestinationCode: "PKU",
		AirlineId:              3,
		FlightScheduleId:       flightSchedule2.ID,
		FlightDuration:         180,
		FlightDepartureDate:    time.Now().Add(time.Hour * 9),
		FlightArrivalDate:      time.Now().Add(time.Hour * 11),
		BasePrice:              829999,
	}

	DB.Create(&flight3)
	DB.Create(&flight4)
	DB.Create(&flight5)

	seatJson3 := models.FlightSeats{
		FlightID:      8,
		FlightClassID: 1,
		SeatsJSON:     datatypes.JSON([]byte(`["16A","16B","16C"]`)),
	}

	seatJson4 := models.FlightSeats{
		FlightID:      9,
		FlightClassID: 2,
		SeatsJSON:     datatypes.JSON([]byte(`["17A","17B","13C"]`)),
	}
	seatJson5 := models.FlightSeats{
		FlightID:      10,
		FlightClassID: 2,
		SeatsJSON:     datatypes.JSON([]byte(`["17A","17B","13C"]`)),
	}

	DB.Create(&seatJson3)
	DB.Create(&seatJson4)
	DB.Create(&seatJson5)

	flightScheduleSegment3 := models.FlightScheduleSegment{
		FlightScheduleId: flightSchedule2.ID,
		FlightId:         flight3.ID,
		SegmentOrder:     1,
		RestTimeMinutes:  120,
	}
	DB.Create(&flightScheduleSegment3)

	flightScheduleSegment4 := models.FlightScheduleSegment{
		FlightScheduleId: flightSchedule2.ID,
		FlightId:         flight4.ID,
		SegmentOrder:     2,
		RestTimeMinutes:  60,
	}
	DB.Create(&flightScheduleSegment4)

	flightScheduleSegment5 := models.FlightScheduleSegment{
		FlightScheduleId: flightSchedule2.ID,
		FlightId:         flight5.ID,
		SegmentOrder:     3,
		RestTimeMinutes:  0,
	}
	DB.Create(&flightScheduleSegment5)

}

func CreateBanks() {
	bankNames := []string{
		"Jago",
		"BCA",
		"BNI",
		"BRI",
		"Danamon",
		"Mandiri",
	}

	bankCodes := []string{
		"ARTO",
		"BBCA",
		"BBNI",
		"BBRI",
		"BDMN",
		"BMRI",
	}

	bankPicturePath := []string{
		`https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/bank%2FARTO.png?alt=media&token=d0d5d5bd-e36a-472a-959f-f0d9d07bb40f`,
		`https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/bank%2FBBCA.png?alt=media&token=65da3786-448a-4b3d-8077-a27b63466b13`,
		`https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/bank%2FBBNI.png?alt=media&token=abfc25d4-b829-4454-ac11-7f2a72505c35`,
		`https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/bank%2FBBRI.png?alt=media&token=013aab1e-28b0-4fde-b6b3-7a52fe7e3b6e`,
		`https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/bank%2FBDMN.png?alt=media&token=806b4721-b88b-4115-8ad7-895f2542f94f`,
		`https://firebasestorage.googleapis.com/v0/b/tpa-web-76f17.appspot.com/o/bank%2FBMRI.png?alt=media&token=5f9c658f-bed6-497a-b10f-3115649ac857`,
	}

	for i := 0; i < 6; i++ {
		bank := models.Bank{
			Name:            bankNames[i],
			Code:            bankCodes[i],
			BankPicturePath: bankPicturePath[i],
		}
		DB.Create(&bank)
	}

}

// func CreateFlight() {
// 	airplane_codes := []string{
// 		"A606",
// 	}

// 	airplane_manufacturer := []string{
// 		"Boeing",
// 	}

// 	airplane_seatRows := []int{
// 		40,
// 	}

// 	airplane_seatCols := []int{
// 		6,
// 	}

// 	for i := 0; i < 1; i++ {
// 		airplane := models.Airplane{
// 			AirplaneCode: airplane_codes[i],
// 			Manufacturer: airplane_manufacturer[i],
// 			SeatRows:     airplane_seatRows[i],
// 			SeatCols:     airplane_seatCols[i],
// 		}
// 		DB.Create(&airplane)
// 	}

// 	airport_codes := []string{
// 		"PKU",
// 		"CGK",
// 		"PNK",
// 		"DPS",
// 	}

// 	airport_name := []string{
// 		"Sultan Syarif Kasim II International Airport",
// 		"Soekarno-Hatta International Airport",
// 		"Supadio International Airport",
// 		"I Gusti Ngurah Rai International Airport",
// 	}

// 	airport_city := []string{
// 		"Pekanbaru",
// 		"Jakarta",
// 		"Pontianak",
// 		"Denpasar",
// 	}

// 	for i := 0; i < 4; i++ {
// 		airport := models.Airport{
// 			Code: airport_codes[i],
// 			Name: airport_name[i],
// 			City: airport_city[i],
// 		}
// 		DB.Create(&airport)
// 	}

// 	flight_class_name := []string{
// 		"Economy",
// 		"Business",
// 		"First-Class",
// 	}

// 	for i := 0; i < 3; i++ {
// 		flight_class := models.FlightClass{
// 			Name: flight_class_name[i],
// 		}
// 		DB.Create(&flight_class)
// 	}

// 	var flight_airplane_code = []string{
// 		"A606",
// 	}

// 	var flight_origin_code = []string{
// 		"PKU",
// 	}

// 	var flight_destination_code = []string{
// 		"CGK",
// 	}

// 	var flight_airline_name = []string{
// 		"Lion Air",
// 	}

// 	var flight_duration = []int{
// 		120,
// 	}

// 	var flight_departure_date = []time.Time{
// 		time.Now().Add(1),
// 	}

// 	var flight_arrival_date = []time.Time{
// 		time.Now().Add(3),
// 	}

// 	var flight_base_price = []float32{
// 		329999,
// 	}

// 	for i := 0; i < 1; i++ {
// 		var flight models.Flight = models.Flight{
// 			AirplaneCode:           flight_airplane_code[i],
// 			AirportOriginCode:      flight_origin_code[i],
// 			AirportDestinationCode: flight_destination_code[i],
// 			FlightAirlineName:      flight_airline_name[i],
// 			FlightDuration:         flight_duration[i],
// 			FlightDepartureDate:    flight_departure_date[i],
// 			FlightArrivalDate:      flight_arrival_date[i],
// 			BasePrice:              flight_base_price[i],
// 		}
// 		DB.Create(&flight)
// 	}

// 	var seats_flight_id = []uint{
// 		1,
// 	}

// 	var seats_flight_class_id = []uint{
// 		1,
// 	}

// 	var seats_JSON = []datatypes.JSON{
// 		datatypes.JSON([]byte(`[
// 			"A1","A2"
// 		  ]`)),
// 	}

// 	for i := 0; i < 1; i++ {
// 		var seats models.FlightSeats = models.FlightSeats{
// 			FlightID:      seats_flight_id[i],
// 			FlightClassID: seats_flight_class_id[i],
// 			SeatsJSON:     seats_JSON[i],
// 		}
// 		DB.Create(&seats)
// 	}

// 	var flight_schedule_basePrice = []uint{
// 		329999,
// 	}

// 	var flight_schedule_baggageMaxWeight = []int{
// 		40,
// 	}

// 	var flight_schedule_cabinMaxWeight = []int{
// 		20,
// 	}

// 	for i := 0; i < 1; i++ {
// 		var flight_schedule models.FlightSchedule = models.FlightSchedule{
// 			BasePrice:        flight_schedule_basePrice[i],
// 			BaggageMaxWeight: flight_schedule_baggageMaxWeight[i],
// 			CabinMaxWeight:   flight_schedule_cabinMaxWeight[i],
// 		}
// 		DB.Create(&flight_schedule)
// 	}

// 	var flight_schedule_segment_flight_schedule_id =  []uint{
// 		1,
// 	}

// 	var flight_schedule_segment_flight_id =  []uint{
// 		1,
// 	}

// 	var flight_schedule_segment_segment_order =  []int{
// 		1,
// 	}

// 	for i := 0; i < 1 ; i++{
// 		var flight_schedule_segment models.FlightScheduleSegment = models.FlightScheduleSegment{
// 			FlightScheduleId: flight_schedule_segment_flight_schedule_id[i],
// 			FlightId:         flight_schedule_segment_flight_id[i],
// 			SegmentOrder:     flight_schedule_segment_segment_order[i],
// 		}

// 		DB.Create(&flight_schedule_segment)
// 	}

// }
