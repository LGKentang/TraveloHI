package mail

import (
	"crypto/rand"
	"encoding/base32"
	"net/http"
	"os"
	"time"

	"github.com/darren/travelohi/handler"
	"github.com/darren/travelohi/models"
	"github.com/gofiber/fiber/v2"
	"github.com/pquerna/otp/totp"
)

func generateRandomSecretKey(length int) (string, error) {
	secretBytes := make([]byte, length)

	_, err := rand.Read(secretBytes)
	if err != nil {
		return "", err
	}

	secretKey := base32.StdEncoding.EncodeToString(secretBytes)

	return secretKey, nil
}

func generateTOTP() (string, time.Time, error) {
	secretBytes, err := generateRandomSecretKey(20)
	if err != nil {
		return "Error generating secret key", time.Time{}, err
	}

	code, err := totp.GenerateCode(secretBytes, time.Now())
	if err != nil {
		return "Error generating OTP", time.Time{}, err
	}

	expiresAt := time.Now().Add(1 * time.Minute)
	return code, expiresAt, nil
}

func SendOtpHandler(c *fiber.Ctx) error {
	var body struct {
		Email string
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to read body",
		})
	}

	if (!handler.CheckEmailExist(body.Email)){
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
            "error": "Email has not been registered in the system",
        })
	}

	sender := NewGmailSender("TraveloHI", os.Getenv("SENDER_EMAIL"), os.Getenv("SENDER_PASSWORD"))

	subject := "TraveloHI OTP Code"
	otpCode, expiresAt, otpErr := generateTOTP()

	if otpErr != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to generate OTP",
			"details": otpErr.Error(),
		})
	}
	content := `
	<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
	  <h2 style="color: #007bff;">Hi, TraveloHI</h2>
	  <p>Your OTP code is <strong style="color: #333;">` + otpCode + `</strong></p>
	  <p style="color: #555;">Thanks for using TraveloHI!</p>
	  <div style="text-align: center; margin-top: 20px;">
		<a href="http://localhost:5173/" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 3px;">Visit TraveloHI</a>
	  </div>
	</div>
  `

	to := []string{body.Email}

	err := sender.SendEmail(subject, content, to, nil, nil, nil)
	if err != nil {
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	otp := models.NewOtp(otpCode, body.Email, expiresAt, false)

	err = handler.AddOtpToDatabase(c, otp)

	if err != nil {
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	return c.SendStatus(fiber.StatusOK)
}
