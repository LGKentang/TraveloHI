package main

import (
	"fmt"
	"time"

	"github.com/darren/travelohi/api"
	"github.com/darren/travelohi/controller"
	"github.com/darren/travelohi/database"
	_ "github.com/darren/travelohi/docs"
	"github.com/darren/travelohi/initializer"
	"github.com/darren/travelohi/mail"
	"github.com/darren/travelohi/middleware"
	"github.com/darren/travelohi/routes"
	"github.com/darren/travelohi/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/swagger"
)

func init() {
	initializer.LoadEnvVariables()
	database.Connect()
	database.SyncDatabase()
	// database.FakeData()
	// database.FakeSpecificData()
}

func main() {
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173",
		AllowMethods:     "GET, POST, PUT, DELETE",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: true,
	}))

	app.Get("/swagger/*", swagger.New(swagger.Config{
		URL:          "http://localhost:3000/swagger/doc.json",
		DeepLinking:  false,
		DocExpansion: "none",
		OAuth: &swagger.OAuthConfig{
			AppName:  "OAuth Provider",
			ClientId: "21bb4edc-05a7-4afc-86f1-2e151e4ba6e2",
		},
		OAuth2RedirectUrl: "http://localhost:8080/swagger/oauth2-redirect.html",
	}))

	app.Get("/", routes.HelloHandler)

	// Authentication routes
	app.Post("/register", controller.SignUp)
	app.Post("/login", controller.Login)
	app.Get("/validate", controller.Validate)
	app.Post("/otp", mail.SendOtpHandler)
	app.Post("/otpLogin", controller.HandleOtpLogin)
	app.Get("/admin", middleware.RequireAdminAuth, controller.Admin)
	app.Get("/logout", controller.Logout)
	app.Get("/game", middleware.RequireAuth, websocket.HandleWebSocket)
	app.Post("/forgotPassword", controller.ForgotPassword)
	// Middleware routes

	// APIs routes
	// Get
	app.Get("/api/user/:id", api.GetUserHandler)
	app.Get("/api/user/all/all", api.GetAllUserHandler)
	app.Get("/api/user/email/:email", api.GetUserByEmailHandler)
	app.Get("/api/user/searchHistory/:id/:type", api.GetLatestSearchHistory)
	app.Get("/api/hotel/get/:id", api.GetHotelHandler)
	app.Get("/api/hotel/get/prefixQuery/:prefix", api.GetHotelPrefixQuery)
	app.Get("/api/hotel/popular", api.GetTopPopularHotelHandler)
	app.Get("/api/promo/all", api.GetAllPromoHandler)
	app.Get("/api/hotel/all", api.GetAllHotelHandler)
	// app.Get("/api/hotel/facilities/main/:id", api.GetMainHotelFacilitiesNameByIdHandler)
	app.Get("/api/hotel/rooms/facilities/all/:id", api.GetAllHotelRoomsWithFacilitiesHandler)
	app.Get("/api/room/type/:id", api.GetRoomTypeHandler)
	app.Get("/api/airline/all", api.GetAllAirlineHandler)
	app.Get("/api/cart/:id", api.GetCartHandler)
	app.Get("/api/cart/total/items/:id", api.GetCartItemTotal)
	app.Get("/api/flights/airline/:airlineId", api.GetFlightsFromAirline)
	app.Get("/api/flight/schedule/:id", api.GetFlightScheduleDetailsById)
	app.Get("/api/flight/seats/:id", api.GetSeatsFromFlightId)
	app.Get("/api/card/:id", api.GetCreditCardsById)
	app.Get("/api/bank/all", api.GetAllBankHandler)
	app.Get("/api/bank/user/:id", api.GetBankingDetailsByUserId)

	// Get [Search]
	app.Get("/api/hotel/search/:name", api.GetHotelsByFuzzyQuery)
	app.Get("/api/hotel/search/address/:name", api.GetHotelsByFuzzyQueryAddress)
	app.Get("/api/airline/search/:name", api.GetAirlineByFuzzyQuery)

	// Post
	app.Post("/api/user/createSearchHistory", api.CreateSearchHistory)
	app.Post("/api/user/sendSubscriptionEmail", api.SendAllEmail)
	app.Post("/api/hotel/reservation/create", api.CreateHotelReservation)
	app.Post("/api/flight/reservation/create", api.CreateFlightReservation)
	app.Post("/api/creditCard/create", api.CreateCreditCard)
	app.Post("/api/bankingDetails/create", api.CreateBankingDetails)
	app.Post("/api/topup", api.TopUpUser)
	app.Post("/api/hotel/buy/now", api.BuyNowHotel)

	// Put
	app.Put("/api/hotel/search_count/:id", api.UpdateHotelSearchCount)
	app.Put("/api/user/ban/:email", api.BanUserHandler)
	app.Put("/api/user/update", api.UpdateUserHandler)
	app.Put("/api/reservation/hotel/update", api.UpdateHotelCheckInOut)
	app.Put("/api/cart/checkout/:id", api.CartCheckout)

	// Delete
	app.Delete("/api/hotel/delete/:id", api.DeleteHotelById)
	app.Delete("/api/cart/delete/all/:id", api.ClearCartById)
	// Debug Socket Players
	// go func(){
	// 	for {
	// 		time.Sleep(1 * time.Second)
	// 		websocket.PrintAllClient()
	// 	}
	// }()

	go func() {
		for {
			time.Sleep(10 * time.Minute)
			fmt.Println("Cleaning up OTP...")
			controller.CleanupExpiredOTP()
		}
	}()

	app.Listen(":3000")
}
