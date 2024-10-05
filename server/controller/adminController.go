package controller

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
)

func Admin(c *fiber.Ctx) error {
	return c.Status(http.StatusOK).JSON(fiber.Map{ "status": "admin"})
}
