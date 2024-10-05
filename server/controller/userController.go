package controller

import (
	"fmt"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/darren/travelohi/database"
	"github.com/darren/travelohi/mail"
	"github.com/darren/travelohi/models"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"

	// "github.com/jordan-wright/email"
	"golang.org/x/crypto/bcrypt"
)

func SignUp(c *fiber.Ctx) error {
	var body struct {
		Email               string `json:"Email"`
		Password            string `json:"Password"`
		ConfirmPassword     string `json:"ConfirmPassword"`
		FirstName           string `json:"FirstName"`
		LastName            string `json:"LastName"`
		Age                 int
		Gender              string `json:"Gender"`
		Dob                 string `json:"Dob"`
		Subscribe           bool   `json:"Subscribe"`
		SecurityAnswer      string `json:"SecurityAnswer"`
		SecurityAnswerIndex int    `json:"SecurityAnswerIndex"`
		ProfilePicturePath  *string `json:"ProfilePicturePath"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to read body",
		})
	}

	if body.Email == "" || body.Password == "" || body.FirstName == "" || body.LastName == "" || body.Gender == ""  {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Please fill in all the required fields",
		})
	}
	fmt.Println(body)
	if body.Age == 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
            "error": "Please enter a valid age",
        })
	}

	fmt.Println(isValidName(body.FirstName))

	if !(len(body.FirstName) > 5 && isValidName(body.FirstName)){
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
            "error": "First name must be at least 5 characters and only contain alphabet",
        })
	}


	if !(len(body.LastName) > 5 && isValidName(body.LastName)){
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
            "error": "Last name must be at least 5 characters and only contain alphabet",
        })
	}


	if body.Gender != "Female" && body.Gender != "Male" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Gender must be Male or Female",
		})
	}
	

	if body.Password != body.ConfirmPassword {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
            "error": "Passwords do not match",
        })
	}

	if body.SecurityAnswer == ""{
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Please fill in the security question",
		})
	}

	if body.Age < 13 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Age must be at least 13 to register",
		})
	}
	
	dobMilliseconds, err := strconv.ParseInt(body.Dob, 10, 64)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse timestamp",
		})
	}

	if !isValidPassword(body.Password){
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
            "error": "Allowed characters for password are capital letters, lower-case letters, numbers, and special symbols, and has a length of 8 – 30 characters.",
        })
	}

	parsedDate := time.Unix(0, dobMilliseconds*int64(time.Millisecond))

	currentUnixTime := time.Now().UnixNano() / int64(time.Millisecond)

	if dobMilliseconds > currentUnixTime {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Date of birth cannot be in the future",
		})
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), 10)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to hash password",
		})
	}

	fmt.Println(body.Dob)

	
	user := models.User{
		Email:                   body.Email,
		Password:                string(hash),
		FirstName:               body.FirstName,
		LastName:                body.LastName,
		Age:                     body.Age,
		Gender:                  body.Gender,
		Dob:                     parsedDate,
		Role:                    "user",
		IsBanned:                new(bool),
		IsActivated:             new(bool),
		IsSubscribeToNewsLetter: &body.Subscribe,
		SecurityAnswerString:    body.SecurityAnswer,
		SecurityAnswerIndex:     body.SecurityAnswerIndex,
		ProfilePicturePath:      body.ProfilePicturePath,
		WalletBalance: 0,
		UsedPromoCode: false,
	}

	*user.IsBanned = false
	*user.IsActivated = true

	result := database.DB.Create(&user)
	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "User already exists",
		})
	}

	mail.SendEmailHandler(c, body.Email, "Registration Successful", `
	 	<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
	 	  <h2 style="color: #007bff;">Hi, `+body.FirstName+" "+body.LastName+`</h2>
	 	  <p>Your TraveloHI Registration is successful.</p>
	 	  <p style="color: #555;">Thanks for using TraveloHI!</p>
	 	  <div style="text-align: center; margin-top: 20px;">
	 		<a href="http://localhost:5173/" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 3px;">Visit TraveloHI</a>
	 	  </div>
	 	</div>
	   `)

	return c.Status(http.StatusOK).JSON(fiber.Map{"success": true})
}

func isValidEmail(email string) bool {
	pattern := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	return regexp.MustCompile(pattern).MatchString(email)
}
func isValidPassword(pw string) bool {
    if len(pw) < 8 || len(pw) > 30 {
        return false
    }

    containsLower := false
    containsUpper := false
    containsDigit := false
    containsSpecial := false
    specialChars := "!@#$%^&*()-_=+"

    for _, char := range pw {
        switch {
        case 'a' <= char && char <= 'z':
            containsLower = true
        case 'A' <= char && char <= 'Z':
            containsUpper = true
        case '0' <= char && char <= '9':
            containsDigit = true
        case strings.ContainsRune(specialChars, char):
            containsSpecial = true
        }
    }

    return containsLower && containsUpper && containsDigit && containsSpecial
}

func isValidName(name string) bool {
	pattern := `^[a-zA-Z]+$`
    return regexp.MustCompile(pattern).MatchString(name)
}

func Login(c *fiber.Ctx) error {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to read body",
		})
	}

	if body.Email == "" || body.Password == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Email and password cannot be empty",
		})
	}

	if !isValidEmail(body.Email) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid email format",
		})
	}

	var user models.User

	database.DB.First(&user, "email = ?", body.Email)

	if user.ID == 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid Email or Password",
		})
	}

	if user.IsBanned != nil && *user.IsBanned {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "This account is banned",
		})
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))

	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid Email or Password",
		})
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   user.ID,
		"exp":   time.Now().Add(time.Hour * 24 * 30).Unix(),
		"email": user.Email,
	})

	secretKey := []byte(os.Getenv("SECRET"))
	if secretKey == nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Secret key not found",
		})
	}

	tokenString, err := token.SignedString(secretKey)

	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to Create Token",
		})
	}

	c.Cookie(&fiber.Cookie{
		Name:    "Authorization",
		Value:   tokenString,
		Expires: time.Now().Add(time.Hour * 24),
		// HTTPOnly: true,
		SameSite: "None",
		// Secure : true,
	})

	// fmt.Println(tokenString)
	// fmt.Println(c.Cookies("Authorization"))

	return c.Status(http.StatusOK).JSON(fiber.Map{"success": true, "token": tokenString})
}

func BypassLogin(c *fiber.Ctx, email string) error {

	var user models.User

	database.DB.First(&user, "email = ?", email)

	if user.ID == 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid Email or Password",
		})
	}

	if user.IsBanned != nil && *user.IsBanned {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "This account is banned",
		})
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   user.ID,
		"exp":   time.Now().Add(time.Hour * 24 * 30).Unix(),
		"email": user.Email,
	})

	secretKey := []byte(os.Getenv("SECRET"))
	if secretKey == nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Secret key not found",
		})
	}

	tokenString, err := token.SignedString(secretKey)

	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to Create Token",
		})
	}

	c.Cookie(&fiber.Cookie{
		Name:    "Authorization",
		Value:   tokenString,
		Expires: time.Now().Add(time.Hour * 24),
		// HTTPOnly: true,
		SameSite: "None",
		// Secure : true,
	})

	return c.Status(http.StatusOK).JSON(fiber.Map{"success": true, "token": tokenString})
}

func ForgotPassword(c *fiber.Ctx) error {
	var body struct {
		Email          string `json:"email"`
		Password       string `json:"password"`
		SecurityAnswer string `json:"securityAnswer"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to read body",
		})
	}

	var user models.User

	database.DB.First(&user, "email = ?", body.Email)

	if user.IsBanned != nil && *user.IsBanned {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "This account is banned",
		})
	}

	if body.SecurityAnswer != user.SecurityAnswerString {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Security Answer is wrong",
		})
	}

	// apple
	// appel

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))

	if err == nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Password cannot be the same as old password",
		})
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), 10)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to hash password",
		})
	}

	updateResult := database.DB.Model(&models.User{}).
		Where("email = ?", body.Email).
		Update("password", string(hash))

	if updateResult.Error != nil {
		// Handle the database update error
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update password in the database",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"status": "success"})
}

func Validate(c *fiber.Ctx) error {
	user := c.Get("user", "")

	return c.Status(http.StatusOK).JSON(fiber.Map{"email": user, "status": "Logged In"})
}

func Logout(c *fiber.Ctx) error {
	fmt.Println("Hello! I am logged out")
	c.ClearCookie("Authorization")
	return c.SendStatus(fiber.StatusNoContent)
}
