package middleware

import (
	"fmt"
	"os"
	"time"

	"github.com/darren/travelohi/database"
	"github.com/darren/travelohi/models"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

func RequireAuth(c *fiber.Ctx) error {
	tokenString := c.Cookies("Authorization")

	fmt.Println("Cookie :")
	fmt.Println(c.Cookies("Authorization"))

	if tokenString == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Unauthorized, token string is empty"})
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("SECRET")), nil
	})

	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Unauthorized, jwt token parsing error"})
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if float64(time.Now().Unix()) > claims["exp"].(float64) {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Unauthorized, comparing time error"})
		}

		var user models.User
		database.DB.First(&user, claims["sub"])

		if user.ID == 0 {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Unauthorized, user is not found"})
		}

		c.Locals("user", user)
	} else {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Unauthorized, unknown error"})
	}

	return c.Next()
}

func RequireAdminAuth(c *fiber.Ctx) error {
	tokenString := c.Cookies("Authorization")

	fmt.Println("Cookie :")
	fmt.Println(c.Cookies("Authorization"))

	if tokenString == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Unauthorized, token string is empty"})
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("SECRET")), nil
	})

	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Unauthorized, jwt token parsing error"})
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if float64(time.Now().Unix()) > claims["exp"].(float64) {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Unauthorized, comparing time error"})
		}

		var user models.User
		database.DB.First(&user, claims["sub"])

		if user.ID == 0 {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Unauthorized, user is not found"})
		}
		if user.Role != "admin" {
			fmt.Printf("%v+", user)
			fmt.Printf("User email is => %s", user.Role)
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Unauthorized, user not admin"})
		}

		c.Locals("user", user)
	} else {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Unauthorized, unknown error"})
	}

	return c.Next()
}
