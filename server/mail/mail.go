package mail

import (
	"net/http"
	"os"

	"github.com/darren/travelohi/handler"
	"github.com/gofiber/fiber/v2"
)

func SendEmailHandler(c *fiber.Ctx , toEmail string, subject string, content string) error {

	if !handler.CheckEmailExist(toEmail) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Email has not been registered in the system",
		})
	}

	sender := NewGmailSender("TraveloHI", os.Getenv("SENDER_EMAIL"), os.Getenv("SENDER_PASSWORD"))

// 	content := 

	to := []string{toEmail}

	err := sender.SendEmail(subject, content, to, nil, nil, nil)
	if err != nil {
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	return c.SendStatus(fiber.StatusOK)
}
