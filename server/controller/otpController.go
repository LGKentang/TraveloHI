package controller

import (
	"fmt"
	"net/http"
	"sync"

	"time"

	"github.com/darren/travelohi/database"
	"github.com/darren/travelohi/models"
	"github.com/gofiber/fiber/v2"
)

var dbMutex sync.Mutex



func HandleOtpLogin(c *fiber.Ctx) error {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	var body struct {
		Email string `json:"email"`
		Otp   string `json:"otp"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var foundOtp models.Otp
	result := database.DB.Where("email = ? AND otp_code = ?", body.Email, body.Otp).First(&foundOtp)

	if result.Error != nil {
		return c.Status(http.StatusOK).JSON(fiber.Map{"error": "OTP is either expired or removed from the database"})
	}

	if foundOtp.ExpiresAt.Before(time.Now()) {
		return c.Status(http.StatusOK).JSON(fiber.Map{"error": "OTP has been expired"})
	}

	foundOtp.HasLoggedIn = true
	return BypassLogin(c, body.Email)
}

func CleanupExpiredOTP() {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	now := time.Now()

	if err := database.DB.Where("expires_at <= ?", now).Delete(&models.Otp{}).Error; err != nil {
		fmt.Println("Error cleaning up expired OTPs:", err)
	}
	var otps []models.Otp
	query := database.DB.Find(&otps)

	if query.Error != nil {
		fmt.Println("Error fetching data:", query.Error)
	} else {
		fmt.Println("Fetched Data:")
		for _, otp := range otps {
			fmt.Printf(otp.OtpCode)
		}
	}
}

func GetAllOTP() ([]models.Otp, error) {
	var otps []models.Otp

	if err := database.DB.Find(&otps).Error; err != nil {
		return nil, err
	}

	return otps, nil
}
