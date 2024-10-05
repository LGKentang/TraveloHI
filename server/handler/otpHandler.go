package handler

import (
	"net/http"

	"github.com/darren/travelohi/database"
	"github.com/darren/travelohi/models"
	"github.com/gofiber/fiber/v2"
)

func AddOtpToDatabase(c *fiber.Ctx, otp *models.Otp) error {
	result := database.DB.Create(otp)

	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to insert OTP into database",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"status": "OTP created successfully"})
}