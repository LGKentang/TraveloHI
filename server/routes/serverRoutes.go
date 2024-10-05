package routes

import "github.com/gofiber/fiber/v2"

func HelloHandler(c *fiber.Ctx) error {
	// Your logic here
	return c.SendString("Hello !!!i!!World!")
}
