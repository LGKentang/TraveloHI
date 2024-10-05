package api

import (
	// "errors"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/http"
	"net/url"
	"reflect"
	"sort"
	"strconv"
	"time"

	// "sort"
	"strings"

	// "github.com/darren/travelohi/database"
	"github.com/darren/travelohi/database"
	"github.com/darren/travelohi/mail"
	"github.com/darren/travelohi/models"
	"github.com/gofiber/fiber/v2"
	"github.com/masatana/go-textdistance"

	// "gorm.io/datatypes"
	"gorm.io/datatypes"
	"gorm.io/gorm"
	// "gorm.io/gorm"
	// "github.com/gorilla/mux"
)

// @Summary Get user by ID
// @Description Get user by ID
// @ID get-user
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} models.User
// @Failure 404 {object} models.ErrorResponse
// @Router /api/user/{id} [get]
func GetUserHandler(c *fiber.Ctx) error {
	return GetDataByParam(c, "id", reflect.TypeOf(models.User{}))
}

func GetAllUserHandler(c *fiber.Ctx) error {
	return GetAllData(c, reflect.TypeOf(models.User{}))
}

// @Summary Delete Hotel by ID
// @Description Delete Hotel by ID
// @ID delete-hotel
// @Produce json
// @Param id path int true "Hotel ID"
// @Success 200 {object} models.Hotel
// @Failure 404 {object} models.ErrorResponse
// @Router /api/user/createSearchHistory [delete]
func DeleteHotelById(c *fiber.Ctx) error {
	id := c.Params("id")

	var hotel models.Hotel
	result := database.DB.Where("id = ?", id).Delete(&hotel)

	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Hotel not found",
		})
	}

	return c.JSON(hotel)
}

func SendAllEmail(c *fiber.Ctx) error {
	var body struct {
		Message string `json:"message"`
	}

	var users []models.User

	database.DB.Where("is_subscribe_to_news_letter = ?", true).Find(&users)
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}
	content := `
	<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
	  <h2 style="color: #007bff;">Subscription Email</h2>
	  <p>Here's your daily subscription letter <strong style="color: #333;">` + body.Message + `</strong></p>
	  <p style="color: #555;">Thanks for using TraveloHI!</p>
	  <div style="text-align: center; margin-top: 20px;">
		<a href="http://localhost:5173/" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 3px;">Visit TraveloHI</a>
	  </div>
	</div>
  `

	for _, user := range users {
		mail.SendEmailHandler(c, user.Email, "Subscription Email", content)
	}

	return c.JSON(`{"status": "success"}`)
}

func BanUserHandler(c *fiber.Ctx) error {
	email := c.Params("email")

	var user models.User
	database.DB.Where("email =?", email).First(&user)

	*user.IsBanned = true
	database.DB.Save(&user)
	return c.JSON(fiber.Map{
		"message": "User successfully banned",
	})
}

func GetUserByEmailHandler(c *fiber.Ctx) error {
	email := c.Params("email")
	fmt.Println(email)
	var user models.User
	result := database.DB.Where("email =?", email).First(&user)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	} else if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal Server Error"})
	}
	return c.JSON(user)
}

func GetHotelHandler(c *fiber.Ctx) error {
	return GetDataByParam(c, "id", reflect.TypeOf(models.Hotel{}))
}

func GetHotelPrefixQuery(c *fiber.Ctx) error {
	encodedPrefix := c.Params("prefix")
	prefix, err := url.QueryUnescape(encodedPrefix)
	if err != nil {
		return err
	}

	prefix = strings.ToLower(prefix)

	var hotels []models.Hotel
	database.DB.
		Where("LOWER(name) LIKE ?", prefix+"%").
		Limit(5).
		Find(&hotels)
	// fmt.Println(hotels)
	return c.JSON(hotels)
}

// @Summary Increment Hotel Search Count by ID
// @Description Increment Hotel Search Count by ID
// @ID put-hotel
// @Produce json
// @Param id path int true "Hotel ID"
// @Success 200 {object} models.Hotel
// @Failure 404 {object} models.ErrorResponse
// @Router /api/hotel/search_count/{id} [put]
func UpdateHotelSearchCount(c *fiber.Ctx) error {
	hotelID := c.Params("id")

	result := database.DB.Model(&models.Hotel{}).Where("id = ?", hotelID).Update("search_count", gorm.Expr("search_count + ?", 1))

	if result.Error != nil {
		return result.Error
	}

	return c.JSON(fiber.Map{
		"message": "Search count updated successfully",
	})
}

// @Summary Create Search History
// @Description Create Search History
// @ID create-search-history
// @Produce json
// @Param request body models.SearchHistory true "Search history request object"
// @Success 200 {object} models.SearchHistory
// @Failure 404 {object} models.ErrorResponse
// @Router /api/user/createSearchHistory [post]
func CreateSearchHistory(c *fiber.Ctx) error {
	var body struct {
		Query  string `json:"query"`
		UserID int    `json:"userId"`
		Type   string `json:"type"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	searchHistory := models.SearchHistory{
		Query:  body.Query,
		UserId: uint(body.UserID),
		Type:   body.Type,
	}

	result := database.DB.Create(&searchHistory)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Success",
	})
}

func GetLatestSearchHistory(c *fiber.Ctx) error {
	userId := c.Params("id")
	searchType := c.Params("type")

	var latestSearchHistory []models.SearchHistory

	result := database.DB.Where("user_id = ? AND type = ?", userId, searchType).Order("created_at desc").Limit(3).Find(&latestSearchHistory)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "No search history found for the given user ID",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	var queries []string

	for _, history := range latestSearchHistory {
		queries = append(queries, history.Query)
	}

	fmt.Println("")
	return c.JSON(queries)
}

func GetHotelsByFuzzyQuery(c *fiber.Ctx) error {
	query := c.Params("name")

	var allHotels []models.Hotel
	result := database.DB.Find(&allHotels)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	var collectedHotels []models.Hotel
	var collectedDistance []int
	var hotelMap = make(map[uint]models.Hotel)

	decodedQuery, err := url.QueryUnescape(query)
	if err != nil {
		fmt.Println("Error decoding:", err)
	}

	queryWords := strings.Fields(strings.ToLower(decodedQuery))

	for _, hotel := range allHotels {
		hotelMap[hotel.ID] = hotel
		hotelNameWords := strings.Fields(strings.ToLower(hotel.Name))
		distance := 0

		collect := false

		for _, queryWord := range queryWords {
			for _, hotelWord := range hotelNameWords {
				distance = textdistance.LevenshteinDistance(queryWord, hotelWord)

				threshold := 5
				if distance <= threshold {
					collect = true
					break
				}
			}
			if collect {
				break
			}
		}

		if collect {
			collectedHotels = append(collectedHotels, hotel)
			collectedDistance = append(collectedDistance, distance)
		}
	}
	for i, hotel := range collectedHotels {
		fmt.Println(i, hotel.Name, collectedDistance[i])
	}

	for i := 0; i < len(collectedDistance)-1; i++ {
		for j := 0; j < len(collectedDistance)-i-1; j++ {
			if collectedDistance[j] > collectedDistance[j+1] {
				collectedHotels[j], collectedHotels[j+1] = collectedHotels[j+1], collectedHotels[j]
				collectedDistance[j], collectedDistance[j+1] = collectedDistance[j+1], collectedDistance[j]
			}
		}
	}

	fmt.Println(collectedHotels)
	for _, hotel := range collectedHotels {
		fmt.Println(hotel.Name)
	}

	return c.JSON(collectedHotels)
}

func GetHotelsByFuzzyQueryAddress(c *fiber.Ctx) error {
	query := c.Params("name")

	var allHotels []models.Hotel
	result := database.DB.Find(&allHotels)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	var collectedHotels []models.Hotel
	var collectedDistance []int
	var hotelMap = make(map[uint]models.Hotel)

	decodedQuery, err := url.QueryUnescape(query)
	if err != nil {
		fmt.Println("Error decoding:", err)
	}

	queryWords := strings.Fields(strings.ToLower(decodedQuery))
	fmt.Println(queryWords)
	for _, hotel := range allHotels {
		hotelMap[hotel.ID] = hotel
		hotelNameWords := strings.Fields(strings.ToLower(hotel.Address))
		distance := 0

		collect := false

		for _, queryWord := range queryWords {
			for _, hotelWord := range hotelNameWords {
				distance = textdistance.LevenshteinDistance(queryWord, hotelWord)

				threshold := 5
				if distance <= threshold {
					collect = true
					break
				}
			}
			if collect {
				break
			}
		}

		if collect {
			collectedHotels = append(collectedHotels, hotel)
			collectedDistance = append(collectedDistance, distance)
		}
	}
	for _, hotel := range collectedHotels {
		fmt.Println(hotel.Address)
	}
	for i := 0; i < len(collectedDistance)-1; i++ {
		for j := 0; j < len(collectedDistance)-i-1; j++ {
			if collectedDistance[j] > collectedDistance[j+1] {
				collectedHotels[j], collectedHotels[j+1] = collectedHotels[j+1], collectedHotels[j]
				collectedDistance[j], collectedDistance[j+1] = collectedDistance[j+1], collectedDistance[j]
			}
		}
	}
	for _, hotel := range collectedHotels {
		fmt.Println(hotel.Address)
	}
	fmt.Println(collectedDistance)

	return c.JSON(collectedHotels)
}

// @Summary Get all promos
// @Description Get all promos
// @ID get-promo
// @Produce json
// @Param id path int true "Promo ID"
// @Success 200 {object} models.Promo
// @Failure 404 {object} models.ErrorResponse
// @Router /api/promo/{id} [get]
func GetAllPromoHandler(c *fiber.Ctx) error {
	return GetAllData(c, reflect.TypeOf(models.Promo{}))
}

func GetAllBankHandler(c *fiber.Ctx) error {
	return GetAllData(c, reflect.TypeOf(models.Bank{}))
}

func GetTopPopularHotelHandler(c *fiber.Ctx) error {
	var topHotels []models.Hotel

	result := database.DB.Order("search_count desc").Limit(5).Find(&topHotels)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal Server Error"})
	}

	return c.JSON(topHotels)
}

func GetAllHotelHandler(c *fiber.Ctx) error {
	return GetAllData(c, reflect.TypeOf(models.Hotel{}))
}

// func GetMainHotelFacilitiesNameByIdHandler(c *fiber.Ctx) error {
//     ID := c.Params("id")

//     var facilitiesJSON []byte

//     result := database.DB.
//         Model(&models.Hotel{}).
//         Where("id = ?", ID).
//         Pluck("hotels.main_facilities_json", &facilitiesJSON)

//     if result.Error != nil {
//         return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
//             "error": result.Error.Error(),
//         })
//     }

//     var facilities []string
//     if err := json.Unmarshal(facilitiesJSON, &facilities); err != nil {
//         return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
//             "error": err.Error(),
//         })
//     }

//     return c.JSON(facilities)
// }

func GetAllHotelRoomsWithFacilitiesHandler(c *fiber.Ctx) error {
	ID := c.Params("id")

	var hotelRooms []models.Room

	result := database.DB.
		Model(&models.Room{}).
		Where("hotel_id =?", ID).
		Find(&hotelRooms)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.JSON(hotelRooms)

	// var hotelFacilities []models.HotelFacilities

	// result := database.DB.
	// 	Model(&models.HotelFacilities{}).
	// 	Preload("Hotel").
	// 	Preload("Facilities").
	// 	Preload("Room").
	// 	Where("hotel_id = ?", ID).
	// 	Find(&hotelFacilities)

	// if result.Error != nil {
	// 	return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
	// 		"error": result.Error.Error(),
	// 	})
	// }

	// roomFacilitiesMap := make(map[string]map[string]interface{})

	// for _, hf := range hotelFacilities {
	// 	roomType := hf.Room.Type
	// 	facilityName := hf.Facilities.Name
	// 	basePrice := hf.Room.BaseMultiplier
	// 	roomID := hf.Room.ID

	// 	if roomData, ok := roomFacilitiesMap[roomType]; ok {

	// 		roomData["facilities"] = append(roomData["facilities"].([]string), facilityName)
	// 	} else {

	// 		roomData = make(map[string]interface{})
	// 		roomData["facilities"] = []string{facilityName}
	// 		roomData["basePrice"] = basePrice
	// 		roomData["roomID"] = roomID
	// 		roomFacilitiesMap[roomType] = roomData
	// 	}
	// }

	// var resultSlice []map[string]interface{}
	// for roomType, roomData := range roomFacilitiesMap {
	// 	resultSlice = append(resultSlice, map[string]interface{}{
	// 		"roomType":   roomType,
	// 		"facilities": roomData["facilities"],
	// 		"basePrice":  roomData["basePrice"],
	// 		"roomID":     roomData["roomID"],
	// 	})
	// }

	// return c.JSON(resultSlice)
}

func GetRoomTypeHandler(c *fiber.Ctx) error {
	return GetDataByParam(c, "id", reflect.TypeOf(models.Room{}))
}

func CreateHotelReservation(c *fiber.Ctx) error {
	var body struct {
		UserID       uint   `json:"user_id"`
		HotelID      uint   `json:"hotel_id"`
		RoomID       uint   `json:"room_id"`
		CheckInDate  string `json:"check_in_date"`
		CheckOutDate string `json:"check_out_date"`
	}

	err := c.BodyParser(&body)

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	fmt.Println(body.CheckInDate)
	fmt.Println(body.CheckOutDate)

	checkInMilliseconds, err := strconv.ParseInt(body.CheckInDate, 10, 64)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse timestamp",
		})
	}

	parsedInDate := time.Unix(0, checkInMilliseconds*int64(time.Millisecond))

	checkOutMilliseconds, err := strconv.ParseInt(body.CheckOutDate, 10, 64)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse timestamp",
		})
	}

	parsedOutDate := time.Unix(0, checkOutMilliseconds*int64(time.Millisecond))

	if parsedInDate.After(parsedOutDate) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Check-in date is after check-out date",
		})
	}

	dayDifference := math.Round(parsedOutDate.Sub(parsedInDate).Hours() / 24)

	var baseMultiplier float32
	result := database.DB.Model(&models.Room{}).
		Where("id = ?", body.RoomID).
		Pluck("base_multiplier", &baseMultiplier)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	var basePrice float32
	result = database.DB.Model(&models.Hotel{}).
		Where("id = ?", body.HotelID).
		Pluck("base_price", &basePrice)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	totalPrice := baseMultiplier * basePrice * float32(dayDifference)
	serviceTax := totalPrice / 170
	var platformTax float32
	platformTax = 5000.0

	totalPrice += serviceTax + platformTax

	hotelReservation := models.HotelReservation{
		HotelId:      body.HotelID,
		RoomId:       body.RoomID,
		CheckInDate:  parsedInDate,
		CheckOutDate: parsedOutDate,
		BookingDays:  uint(dayDifference),
		TotalPrice:   totalPrice,
	}

	dataResult := database.DB.Create(&hotelReservation)

	cartReservation := models.ReservationCart{
		UserId:              body.UserID,
		HotelReservationId:  &hotelReservation.ID,
		FlightReservationId: nil,
		ExpiredAt:           time.Now().Add(time.Hour * 24),
		Paid:                false,
	}

	cartResult := database.DB.Create(&cartReservation)

	if dataResult.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	if cartResult.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.JSON(`{status: "Success reserving hotel"}`)
}

func CreateFlightReservation(c *fiber.Ctx) error {
	var body struct {
		UserID             uint   `json:"user_id"`
		Transit            bool   `json:"transit"`
		ReservationId      uint   `json:"reservation_id"`
		FlightClass        string `json:"flight_class"`
		Seats              string `json:"seats"`
		AddOnBaggagePrice  uint   `json:"add_on_baggage_price"`
		AddOnBaggageWeight uint   `json:"add_on_baggage_weight"`
	}

	err := c.BodyParser(&body)

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	var flight_class_id uint
	result := database.DB.Model(&models.FlightClass{}).Where("name = ?", body.FlightClass).Pluck("id", &flight_class_id)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	fmt.Println(flight_class_id)

	var seats map[string]interface{}
	if err := json.Unmarshal([]byte(body.Seats), &seats); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse seats JSON: " + err.Error(),
		})
	}

	for key, value := range seats {
		fmt.Println("WOW")
		fmt.Println(key, value)
		var flightSeats models.FlightSeats

		result = database.DB.Model(&models.FlightSeats{}).
			Where("flight_id = ? AND flight_class_id = ?", key, flight_class_id).
			Find(&flightSeats)

		if result.Error != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": result.Error.Error(),
			})
		}

		// fmt.Println(flightSeats.SeatsJSON)
		var seat_in_plane []string

		if len(flightSeats.SeatsJSON) != 0 {
			if err := json.Unmarshal([]byte(flightSeats.SeatsJSON), &seat_in_plane); err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Failed to parse seats JSON: " + err.Error(),
				})
			}

			if contains(seat_in_plane, value.(string)) {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "This seat is already reserved",
				})
			}
		}

		// seatValue, ok := value.(string)
		// if !ok {
		// 	return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
		// 		"error": "Value is not a string",
		// 	})
		// }

		// fmt.Println(seat_in_plane, value)
	}

	// var schedule models.FlightSchedule
	// database.DB.Model(&models.FlightSchedule{}).Where("id = ?", body.ReservationId).Find(&schedule)
	// fmt.Println(schedule)

	// fmt.Println(seats)

	flightRes := models.FlightReservation{
		FlightScheduleId:           body.ReservationId,
		FlightClassId:              flight_class_id,
		FlightSeatsReservationJson: datatypes.JSON(body.Seats),
		AddOnBaggagePrice:          float32(body.AddOnBaggagePrice),
	}

	database.DB.Create(&flightRes)

	reservationFlight := models.ReservationCart{
		UserId:              body.UserID,
		FlightReservationId: &flightRes.ID,
		ExpiredAt:           time.Now().Add(time.Hour * 24),
		Paid:                false,
	}

	database.DB.Create(&reservationFlight)

	return c.JSON("{}")
}

func contains(slice []string, value string) bool {
	for _, item := range slice {
		if item == value {
			return true
		}
	}
	return false
}

type CartWithFlight struct {
	Cart       models.ReservationCart
	FlightData interface{}
	Expired    bool
	Ended	   bool
}

func GetCartHandler(c *fiber.Ctx) error {
	userID := c.Params("id")

	var carts []models.ReservationCart;

	result := database.DB.
		Model(&models.ReservationCart{}).
		Preload("FlightReservation").
		Preload("FlightReservation.FlightSchedule").
		Preload("HotelReservation").
		Preload("HotelReservation.Hotel").
		Preload("HotelReservation.Room").
		Where("user_id = ?", userID).
		Find(&carts)

	var cartWithFlights []CartWithFlight
	// fmt.Println("hi")
	for _, cart := range carts {
		var flightData interface{}
		ended := false;
		if cart.FlightReservationId != nil {
			flightScheduleID := cart.FlightReservation.FlightSchedule.ID
			fmt.Println(flightScheduleID)
			flightData = GetFlightReservationData(flightScheduleID)

			flightScheduleId := cart.FlightReservation.FlightScheduleId;
			var flightId uint;

			result := database.DB.Model(&models.FlightScheduleSegment{}).
			Where("flight_schedule_id = ?", flightScheduleId).
			Order("segment_order DESC").
			Limit(1).
			Pluck("flight_id", &flightId)

			if result.Error!= nil {
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                    "error": result.Error.Error(),
                })
            }

			var endTime time.Time;
			result = database.DB.Model(&models.Flight{}).
			Where("id = ?", flightId).
			Pluck("flight_arrival_date", &endTime)

			if result.Error!= nil {
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                    "error": result.Error.Error(),
                })
            }

			fmt.Println(endTime)
			if endTime.Before(time.Now()) {
				ended = true;
			}
		} else {
			flightData = nil

			if cart.HotelReservation.CheckOutDate.Before(time.Now()){
				ended = true;
			}
		}

		expired := cart.ExpiredAt.Before(time.Now())
		// fmt.Println(flightData)
		cartWithFlights = append(cartWithFlights, CartWithFlight{Cart: cart, FlightData: flightData, Expired: expired, Ended: ended})
	}

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.JSON(cartWithFlights)
}

func GetCartItemTotal(c *fiber.Ctx) error {
	userID := c.Params("id")

	var carts []models.ReservationCart

	result := database.DB.
		Model(&models.ReservationCart{}).
		Where("user_id = ? AND paid = ?", userID, false).
		Find(&carts)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	var hotelReservationCount int
	var flightReservationCount int
	for _, cart := range carts {
		if cart.HotelReservationId != nil {
			hotelReservationCount++
		} else {
			flightReservationCount++
		}
	}

	return c.JSON(fiber.Map{
		"totalItems":  len(carts),
		"hotelCount":  hotelReservationCount,
		"flightCount": flightReservationCount,
	})
}

func GetAllAirlineHandler(c *fiber.Ctx) error {
	var airlines []models.Airline

	result := database.DB.Model(&models.Airline{}).Find(&airlines)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.JSON(airlines)
}

func GetAirlineByFuzzyQuery(c *fiber.Ctx) error {
	query := c.Params("name")

	var closestAirlineID uint
	var closestTotalDistance = math.MaxInt32

	var airlines []models.Airline
	result := database.DB.Model(&models.Airline{}).Find(&airlines)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	decodedQuery, err := url.QueryUnescape(query)
	if err != nil {
		fmt.Println("Error decoding:", err)
	}

	queryWords := strings.Fields(strings.ToLower(decodedQuery))

	for _, airline := range airlines {
		totalDistance := 0

		airlineWords := strings.Fields(strings.ToLower(airline.Name))

		for _, queryWord := range queryWords {
			minDistance := math.MaxInt32

			for _, airlineWord := range airlineWords {
				distance := textdistance.LevenshteinDistance(queryWord, airlineWord)
				if distance < minDistance {
					minDistance = distance
				}
			}

			totalDistance += minDistance
		}

		if totalDistance < closestTotalDistance {
			closestTotalDistance = totalDistance
			closestAirlineID = airline.ID
		}
	}

	return c.JSON(fiber.Map{
		"closest_airline_id": closestAirlineID,
	})
}

type FlightTotalPrice struct {
	flight     models.Flight
	totalPrice float32
}

func GetFlightsFromAirline(c *fiber.Ctx) error {
	airlineID := c.Params("airlineId")
	var flights []models.Flight

	// Retrieve direct flights
	result := database.DB.Model(&models.Flight{}).
		Preload("Airline").
		Preload("Airplane").
		Preload("DestinationAirport").
		Preload("OriginAirport").
		Where("airline_id = ?", airlineID).
		Find(&flights)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	var allFlights []interface{}

	// Iterate through direct flights
	for _, flight := range flights {
		if !flight.IsTransit {
			newFlight := map[string]interface{}{
				"flight":        flight,
				"totalPrice":    flight.BasePrice,
				"transitCount":  0,
				"totalDuration": flight.FlightDuration,
			}
			allFlights = append(allFlights, newFlight)
		} else {
			var flight_schedule_id uint
			// Retrieve transit flights
			result := database.DB.Model(&models.FlightScheduleSegment{}).
				Where("flight_id = ?", flight.ID).
				Pluck("flight_schedule_id", &flight_schedule_id)

			if result.Error != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": result.Error.Error(),
				})
			}

			var segments []models.FlightScheduleSegment

			// Retrieve segments of transit flights
			result = database.DB.Model(&models.FlightScheduleSegment{}).
				Where("flight_schedule_id = ?", flight_schedule_id).
				Preload("Flight").
				Preload("Flight.DestinationAirport").
				Preload("Flight.OriginAirport").
				Find(&segments)

			if result.Error != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": result.Error.Error(),
				})
			}

			var totalDuration uint
			var totalBasePrice float64

			for _, segment := range segments {
				totalDuration += uint(segment.Flight.FlightDuration)
				totalBasePrice += float64(segment.Flight.BasePrice)
			}

			// Combine transit flights with direct flights and label them
			allFlights = append(allFlights, map[string]interface{}{
				"flight":        flight,
				"segment":       findSegmentRange(segments),
				"label":         "transit",
				"transitCount":  int(len(segments) - 1),
				"totalDuration": totalDuration,
				"totalPrice":    totalBasePrice,
			})
		}
	}
	// fmt.Println(allFlights[0])
	return c.JSON(allFlights)
}

func GetFlightScheduleDetailsById(c *fiber.Ctx) error {
	scheduleId := c.Params("id")

	var flightSchedule models.FlightSchedule
	result := database.DB.Model(&models.FlightSchedule{}).
		Where("id=?", scheduleId).Find(&flightSchedule)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	// fmt.Println(flightSchedule)

	if !flightSchedule.IsTransit {
		var flight models.Flight
		var fss models.FlightScheduleSegment
		result := database.DB.Model(&models.FlightScheduleSegment{}).Preload("Flight").
			Where("flight_schedule_id = ?", flightSchedule.ID).
			Preload("Flight").
			Preload("Flight.Airline").
			Preload("Flight.Airplane").
			Preload("Flight.DestinationAirport").
			Preload("Flight.OriginAirport").
			Find(&fss)

		flight = fss.Flight

		if result.Error != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": result.Error.Error(),
			})
		}

		item := map[string]interface{}{
			"flight":   flight,
			"schedule": flightSchedule,
		}
		return c.JSON(item)
	}

	var segments []models.FlightScheduleSegment

	result = database.DB.Model(&models.FlightScheduleSegment{}).
		Preload("Flight").
		Where("flight_schedule_id=?", flightSchedule.ID).
		Preload("Flight").
		Preload("Flight.Airline").
		Preload("Flight.Airplane").
		Preload("Flight.DestinationAirport").
		Preload("Flight.OriginAirport").Order("segment_order").Find(&segments)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	var flights []models.Flight
	var totalDuration uint
	var totalBasePrice float64
	var restTimes []int

	for _, segment := range segments {
		flights = append(flights, segment.Flight)
		totalDuration += uint(segment.Flight.FlightDuration)
		totalBasePrice += float64(segment.Flight.BasePrice)
		restTimes = append(restTimes, segment.RestTimeMinutes)
	}

	segmentRange := findSegmentRange(segments)

	additionalData := map[string]interface{}{
		"transits":      len(segments) - 1,
		"totalDuration": totalDuration,
		"totalPrice":    totalBasePrice,
		"restTimes":     restTimes,
	}

	item := map[string]interface{}{
		"flight":         flights,
		"schedule":       flightSchedule,
		"additionalData": additionalData,
		"segmentRange":   segmentRange,
	}
	return c.JSON(item)
}

func GetFlightReservationData(id uint) interface{} {
	var flightSchedule models.FlightSchedule
	result := database.DB.Model(&models.FlightSchedule{}).
		Where("id=?", id).Find(&flightSchedule)

	if result.Error != nil {
		return map[string]interface{}{"error": result.Error.Error()}
	}

	// fmt.Println(flightSchedule)

	if !flightSchedule.IsTransit {
		var flight models.Flight
		var fss models.FlightScheduleSegment
		result := database.DB.Model(&models.FlightScheduleSegment{}).Preload("Flight").
			Where("flight_schedule_id = ?", flightSchedule.ID).
			Preload("Flight").
			Preload("Flight.Airline").
			Preload("Flight.Airplane").
			Preload("Flight.DestinationAirport").
			Preload("Flight.OriginAirport").
			Find(&fss)

		flight = fss.Flight

		if result.Error != nil {
			return map[string]interface{}{"error": result.Error.Error()}
		}

		item := map[string]interface{}{
			"flight":   flight,
			"schedule": flightSchedule,
		}
		return item
	}

	var segments []models.FlightScheduleSegment

	result = database.DB.Model(&models.FlightScheduleSegment{}).
		Preload("Flight").
		Where("flight_schedule_id=?", flightSchedule.ID).
		Preload("Flight").
		Preload("Flight.Airline").
		Preload("Flight.Airplane").
		Preload("Flight.DestinationAirport").
		Preload("Flight.OriginAirport").Order("segment_order").Find(&segments)

	if result.Error != nil {
		return map[string]interface{}{"error": result.Error.Error()}
	}

	var flights []models.Flight
	var totalDuration uint
	var totalBasePrice float64
	var restTimes []int

	for _, segment := range segments {
		flights = append(flights, segment.Flight)
		totalDuration += uint(segment.Flight.FlightDuration)
		totalBasePrice += float64(segment.Flight.BasePrice)
		restTimes = append(restTimes, segment.RestTimeMinutes)
	}

	segmentRange := findSegmentRange(segments)

	additionalData := map[string]interface{}{
		"transits":      len(segments) - 1,
		"totalDuration": totalDuration,
		"totalPrice":    totalBasePrice,
		"restTimes":     restTimes,
	}

	item := map[string]interface{}{
		"flight":         flights,
		"schedule":       flightSchedule,
		"additionalData": additionalData,
		"segmentRange":   segmentRange,
	}
	return item
}

func findSegmentRange(segments []models.FlightScheduleSegment) map[string]interface{} {
	// Sort segments by segmentOrder
	sort.Slice(segments, func(i, j int) bool {
		return segments[i].SegmentOrder < segments[j].SegmentOrder
	})

	// Get the origin airport for the lowest segment order
	lowestSegmentOrderOrigin := segments[0].Flight

	// Get the destination airport for the highest segment order
	highestSegmentOrderDestination := segments[len(segments)-1].Flight

	// Create a map to hold the segment range
	segmentRange := map[string]interface{}{
		"OriginSegment":      lowestSegmentOrderOrigin,
		"DestinationSegment": highestSegmentOrderDestination,
	}
	return segmentRange
}

func GetSeatsFromFlightId(c *fiber.Ctx) error {
	flightId := c.Params("id")

	var seats []models.FlightSeats

	result := database.DB.Model(&models.FlightSeats{}).
		Where("flight_id=?", flightId).Order("flight_class_id").Find(&seats)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.JSON(seats)
}

func CreateCreditCard(c *fiber.Ctx) error {
	var body struct {
		UserId          uint   `json:"user_id"`
		CardNumber      string `json:"card_number"`
		CardHolder      string `json:"card_holder"`
		CardExpiryMonth int    `json:"card_expiry_month"`
		CardExpiryYear  int    `json:"card_expiry_year"`
		CardCvv         string `json:"card_cvv"`
	}

	// body.CardExpiryYear = body.CardExpiryYear + 2000;

	if err := c.BodyParser(&body); err != nil {
		fmt.Println(err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	fmt.Println(body)

	creditCard := models.CreditCard{
		CardNumber:     body.CardNumber,
		SecurityCode:   body.CardCvv,
		CardHolderName: body.CardHolder,
		ExpirationDate: time.Date(body.CardExpiryYear+2000, time.Month(body.CardExpiryMonth), 1, 0, 0, 0, 0, time.UTC),
	}

	result := database.DB.Create(&creditCard)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	creditCardUser := models.CreditCardUser{
		CreditCardId: creditCard.ID,
		UserId:       body.UserId,
	}

	result = database.DB.Create(&creditCardUser)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.JSON(map[string]interface{}{
		"success": true,
	})
}

func GetCreditCardsById(c *fiber.Ctx) error {
	id := c.Params("id")
	fmt.Println(id)
	var creditCard []models.CreditCardUser

	result := database.DB.Model(&models.CreditCardUser{}).
		Where("user_id=?", id).Preload("CreditCard").Find(&creditCard)

	if result.Error != nil {
		fmt.Println("error!")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	r := c.JSON(creditCard)

	fmt.Println(r)
	return c.JSON(creditCard)
}

func CreateBankingDetails(c *fiber.Ctx) error {
	var body struct {
		UserId        uint   `json:"user_id"`
		BankId        uint   `json:"bank_id"`
		AccountNumber string `json:"account_number"`
	}

	if err := c.BodyParser(&body); err != nil {
		fmt.Println(err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	fmt.Println(body)
	bankingDetails := models.BankingUser{
		UserId:        body.UserId,
		BankId:        body.BankId,
		AccountNumber: body.AccountNumber,
	}

	result := database.DB.Create(&bankingDetails)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.JSON(map[string]interface{}{
		"success": true,
	})

}

func UpdateUserHandler(c *fiber.Ctx) error {
	var body struct {
		UserId                  uint   `json:"user_id"`
		FirstName               string `json:"first_name"`
		LastName                string `json:"last_name"`
		Email                   string `json:"email"`
		Age                     int    `json:"age"`
		Gender                  string `json:"gender"`
		IsSubscribeToNewsLetter bool   `json:"is_subscribed"`
		ProfilePicturePath      string `json:"profile_picture_path"`
	}
	if err := c.BodyParser(&body); err != nil {
		fmt.Println(err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	var user models.User
	if err := database.DB.First(&user, body.UserId).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	user.FirstName = body.FirstName
	user.LastName = body.LastName
	user.Email = body.Email
	user.Age = body.Age
	user.Gender = body.Gender
	user.IsSubscribeToNewsLetter = &body.IsSubscribeToNewsLetter
	user.ProfilePicturePath = &body.ProfilePicturePath

	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
	})
}

func GetBankingDetailsByUserId(c *fiber.Ctx) error {
	id := c.Params("id")
	fmt.Println(id)
	var bankingDetails []models.BankingUser

	result := database.DB.Model(&models.BankingUser{}).
		Where("user_id=?", id).Preload("Bank").Find(&bankingDetails)

	if result.Error != nil {
		fmt.Println("error!")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	r := c.JSON(bankingDetails)

	fmt.Println(r)
	return c.JSON(bankingDetails)
}

func TopUpUser(c *fiber.Ctx) error {
	var body struct {
		UserId uint `json:"user_id"`
		Money  uint `json:"money"`
	}

	if err := c.BodyParser(&body); err != nil {
		fmt.Println(err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	var user models.User
	result := database.DB.Model(&models.User{}).Where("id=?", body.UserId).Find(&user)

	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	user.WalletBalance += body.Money

	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
	})

}

func UpdateHotelCheckInOut(c *fiber.Ctx) error {
	var body struct {
		CartId        uint   `json:"cart_id"`
		HotelId       uint   `json:"hotel_id"`
		RoomId        uint   `json:"room_id"`
		ReservationId uint   `json:"reservation_id"`
		CheckInDate   string `json:"check_in_date"`
		CheckOutDate  string `json:"check_out_date"`
	}

	err := c.BodyParser(&body)

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	fmt.Println(body.CheckInDate)
	fmt.Println(body.CheckOutDate)

	var expiredAt time.Time
	database.DB.Model(&models.ReservationCart{}).Where("id = ?", body.CartId).Pluck("expired_at", &expiredAt)

	if (time.Now()).After(expiredAt) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot update because ticket has been expired",
		})
	}
	fmt.Println(expiredAt)

	checkInMilliseconds, err := strconv.ParseInt(body.CheckInDate, 10, 64)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	parsedInDate := time.Unix(0, checkInMilliseconds*int64(time.Millisecond))

	checkOutMilliseconds, err := strconv.ParseInt(body.CheckOutDate, 10, 64)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse timestamp",
		})
	}

	parsedOutDate := time.Unix(0, checkOutMilliseconds*int64(time.Millisecond))

	if parsedInDate.After(parsedOutDate) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Check-in date is after check-out date",
		})
	}

	var reservation models.HotelReservation
	database.DB.Model(&models.HotelReservation{}).Where("id = ?", body.ReservationId).Find(&reservation)

	dayDifference := math.Round(parsedOutDate.Sub(parsedInDate).Hours() / 24)

	var baseMultiplier float32
	result := database.DB.Model(&models.Room{}).
		Where("id = ?", body.RoomId).
		Pluck("base_multiplier", &baseMultiplier)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	var basePrice float32
	result = database.DB.Model(&models.Hotel{}).
		Where("id = ?", body.HotelId).
		Pluck("base_price", &basePrice)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	totalPrice := baseMultiplier * basePrice * float32(dayDifference)
	serviceTax := totalPrice / 170
	var platformTax float32
	platformTax = 5000.0

	totalPrice += serviceTax + platformTax

	reservation.CheckInDate = parsedInDate
	reservation.CheckOutDate = parsedOutDate
	reservation.TotalPrice = totalPrice

	if err := database.DB.Save(&reservation).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
	})
}

func BuyNowHotel(c *fiber.Ctx) error {
	var body struct {
		UserID        uint   `json:"user_id"`
		HotelID       uint   `json:"hotel_id"`
		RoomID        uint   `json:"room_id"`
		CheckInDate   string `json:"check_in_date"`
		CheckOutDate  string `json:"check_out_date"`
		PaymentMethod string `json:"payment_method"`
	}

	err := c.BodyParser(&body)

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	checkInMilliseconds, err := strconv.ParseInt(body.CheckInDate, 10, 64)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse timestamp",
		})
	}

	parsedInDate := time.Unix(0, checkInMilliseconds*int64(time.Millisecond))

	checkOutMilliseconds, err := strconv.ParseInt(body.CheckOutDate, 10, 64)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse timestamp",
		})
	}

	parsedOutDate := time.Unix(0, checkOutMilliseconds*int64(time.Millisecond))

	if parsedInDate.After(parsedOutDate) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Check-in date is after check-out date",
		})
	}

	dayDifference := math.Round(parsedOutDate.Sub(parsedInDate).Hours() / 24)

	var baseMultiplier float32
	result := database.DB.Model(&models.Room{}).
		Where("id = ?", body.RoomID).
		Pluck("base_multiplier", &baseMultiplier)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	var basePrice float32
	result = database.DB.Model(&models.Hotel{}).
		Where("id = ?", body.HotelID).
		Pluck("base_price", &basePrice)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	totalPrice := baseMultiplier * basePrice * float32(dayDifference)
	serviceTax := totalPrice / 170
	var platformTax float32
	platformTax = 5000.0

	totalPrice += serviceTax + platformTax

	hotelReservation := models.HotelReservation{
		HotelId:      body.HotelID,
		RoomId:       body.RoomID,
		CheckInDate:  parsedInDate,
		CheckOutDate: parsedOutDate,
		BookingDays:  uint(dayDifference),
		TotalPrice:   totalPrice,
	}

	dataResult := database.DB.Create(&hotelReservation)

	cartReservation := models.ReservationCart{
		UserId:              body.UserID,
		HotelReservationId:  &hotelReservation.ID,
		FlightReservationId: nil,
		ExpiredAt:           time.Now().Add(time.Hour * 24),
		Paid:                true,
	}

	cartResult := database.DB.Create(&cartReservation)

	if dataResult.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	if cartResult.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.JSON(`{status: "Success reserving hotel"}`)
}

func CartCheckout(c *fiber.Ctx) error {
	userId := c.Params("id")

	var body struct {
		Promo         *uint  `json:"promo"`
		PaymentMethod string `json:"payment_method"`
		Card          *uint  `json:"card"`
	}

	err := c.BodyParser(&body)

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	fmt.Println(body)
	var cartObjects []models.ReservationCart

	currentTime := time.Now().Format("2006-01-02 15:04:05.999999-07")
	res := database.DB.Model(&models.ReservationCart{}).Preload("FlightReservation").Preload("FlightReservation.FlightSchedule").Preload("HotelReservation").
		Where("user_id =? AND paid = ? AND expired_at > ?", userId, false, currentTime).
		Find(&cartObjects)

	if res.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": res.Error.Error(),
		})
	}

	var totalPrice int32

	for _, cart := range cartObjects {
		// fmt.Println(cart.ID)
		if cart.HotelReservationId != nil {
			totalPrice += int32(cart.HotelReservation.TotalPrice)
		} else if cart.FlightReservationId != nil {

			resData := GetFlightReservationData(cart.FlightReservation.FlightScheduleId)
			data, ok := resData.(map[string]interface{})

			if !ok {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "failed to map data",
				})
			}
			if cart.FlightReservation.FlightSchedule.IsTransit {
				additionalData, ok := data["additionalData"]
				if !ok {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "error mapping data 2"})
				}

				totalPrice += int32(additionalData.(map[string]interface{})["totalPrice"].(float64))
				// fmt.Println("Additional Data:", additionalData.(map[string]interface{})["totalPrice"])

			} else if !cart.FlightReservation.FlightSchedule.IsTransit {

				flight, ok := data["flight"].(models.Flight)
				if !ok {

					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "flight data is not of expected type"})
				}
				totalPrice += int32(flight.BasePrice)

			}
		}
	}

	var userBalance uint

	result := database.DB.Model(&models.User{}).Where("id = ?", userId).Pluck("wallet_balance", &userBalance)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	if body.PaymentMethod != "wallet" && body.PaymentMethod != "credit" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid Payment Method",
		})
	}

	var creditConnections []models.CreditCardUser

	result = database.DB.Model(&models.CreditCardUser{}).Where("user_id = ? AND credit_card_id = ?", userId, body.Card).Find(&creditConnections)

	if result == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Credit card does not exist on user",
		})
	}

	var user models.User
	result = database.DB.Model(&models.User{}).Where("id =?", userId).Find(&user)
	if result == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "User does not exist",
		})
	}

	if body.Promo != nil {
		var promo models.Promo

		result = database.DB.Model(&models.Promo{}).Where("id =?", *body.Promo).Find(&promo)

		if result == nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Promo does not exist",
			})
		}

		if user.UsedPromoCode {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "User has already used a promo once",
			})
		}

		if promo.Percentage != nil {
			totalDiscount := *promo.Percentage * float32(totalPrice)
			totalPrice = totalPrice - int32(totalDiscount)
		} else {
			totalDiscount := *promo.Value
			totalPrice = totalPrice - int32(totalDiscount)
		}
		user.UsedPromoCode = true
	}

	// var creditCard models.CreditCard;
	// result = database.DB.Model(&models.CreditCard{}).Where("id = ?",body.Card).Find(&creditCard)

	// if (body.PaymentMethod == "credit" && userId != creditCard)

	// var paymentDetailBuilder string;
	fmt.Println(userBalance, totalPrice)
	if body.PaymentMethod == "wallet" && userBalance < uint(totalPrice) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Insufficient balance",
		})
	} 
	
	if body.PaymentMethod == "wallet" {
		// fmt.Println()
		// result = database.DB.Model(&models.User{}).
		// Where("id=?", userId).
		// Update("wallet_balance", userBalance-uint(totalPrice))
		user.WalletBalance = userBalance-uint(totalPrice)
		fmt.Println(user.WalletBalance)

		if result.Error != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": result.Error.Error(),
			})
		}
		database.DB.Save(&user)
	}

	totalPriceStr := strconv.Itoa(int(totalPrice))

	// Concatenate totalPriceStr with the email message
	emailMessage := `<div> Your bill is ` + totalPriceStr + `, thank you for purchasing with TraveloHI</div>`

	// Send the email with the updated message
	mail.SendEmailHandler(c, user.Email, "Payment Details", emailMessage)

	for _, cart := range cartObjects {
		cart.Paid = true
		result = database.DB.Save(&cart)
		if result.Error != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": result.Error.Error(),
			})
		}	
	}

	// result = database.DB.Save(&user)
	// if result.Error != nil {
	// 	return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
	// 		"error": result.Error.Error(),
	// 	})
	// }
	// database.DB.Save(&cartObjects)

	// fmt.Println(totalPrice)
	return c.JSON(cartObjects)

}

func ClearCartById(c *fiber.Ctx) error {
	id := c.Params("id")

	res := database.DB.Model(&models.ReservationCart{}).
		Where("user_id = ?", id).Delete(&models.ReservationCart{})

	if res.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": res.Error.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"success": "clear cart succeed"})
}

// func GetFlightsFromAirline(c *fiber.Ctx) error {
// 	airlineID := c.Params("airlineId")
// 	// fmt.Println(airlineID)
// 	var flights []models.Flight

// 	result := database.DB.Model(&models.Flight{}).
// 		Preload("Airline").
// 		Preload("Airplane").
// 		Preload("DestinationAirport").
// 		Preload("OriginAirport").
// 		Where("airline_id =?", airlineID).
// 		Find(&flights)

// 	if result.Error != nil {
// 		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
// 			"error": result.Error.Error(),
// 		})
// 	}

// 	for _, flight := range flights {
// 		if flight.IsTransit {
// 			var flight_schedule_id uint
// 			result := database.DB.Model(&models.FlightScheduleSegment{}).
// 				Where("flight_id = ?", flight.ID).
// 				Pluck("flight_schedule_id", &flight_schedule_id)

// 			if result.Error != nil {
// 				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
// 					"error": result.Error.Error(),
// 				})
// 			}

// 			var segments []models.FlightScheduleSegment

// 			result = database.DB.Model(&models.FlightScheduleSegment{}).
// 				Where("flight_schedule_id =?", flight_schedule_id).
// 				Preload("Flight").
// 				Preload("Flight.DestinationAirport").
// 				Preload("Flight.OriginAirport").
// 				Find(&segments)

// 			if result.Error != nil {
// 				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
// 					"error": result.Error.Error(),
// 				})
// 			}

// 			segmentRange := findSegmentRange(segments)
// 			fmt.Println(segmentRange)

// 			return c.JSON(segmentRange)

// 		}
// 	}

// 	return c.JSON(flights)
// }

// func GetFlightsFromAirline(c *fiber.Ctx) error {
// 	airlineID := c.Params("airlineId")
// 	// fmt.Println(airlineID)
// 	var flights []models.Flight

// 	result := database.DB.Model(&models.Flight{}).
// 		Preload("Airline").
// 		Preload("Airplane").
// 		Preload("DestinationAirport").
// 		Preload("OriginAirport").
// 		Where("airline_id =?", airlineID).
// 		Find(&flights)

// 	if result.Error != nil {
// 		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
// 			"error": result.Error.Error(),
// 		})
// 	}

// 	return c.JSON(flights)
// }

// func GetAirlineByFuzzyQuery(c *fiber.Ctx) error {
// 	query := c.Params("name")

// 	var closestAirlineID uint
// 	var closestDistance = math.MaxInt32

// 	var airlines []models.Airline
// 	result := database.DB.Model(&models.Airline{}).Find(&airlines)
// 	if result.Error != nil {
// 		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
// 			"error": result.Error.Error(),
// 		})
// 	}

// 	decodedQuery, err := url.QueryUnescape(query)
// 	if err != nil {
// 		fmt.Println("Error decoding:", err)
// 	}

// 	for _, airline := range airlines {
// 		distance := textdistance.LevenshteinDistance(decodedQuery, airline.Name)
// 		if distance < closestDistance {
// 			closestDistance = distance
// 			closestAirlineID = airline.ID
// 		}
// 	}

// 	return c.JSON(fiber.Map{
// 		"closest_airline_id": closestAirlineID,
// 	})
// }

// func GetPromoHander(c *fiber.Ctx) error {
// 	promoID := c.Params("id")

// 	var promo models.Promo

// }

// userID := c.Params("id")

// var user models.User
// result := database.DB.First(&user, userID)

// if errors.Is(result.Error, gorm.ErrRecordNotFound) {
// 	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
// } else if result.Error != nil {
// 	return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal Server Error"})
// }

// return c.JSON(user)
