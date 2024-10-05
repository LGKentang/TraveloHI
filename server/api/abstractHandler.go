package api

import (
	"errors"
	// "fmt"
	"reflect"

	"github.com/darren/travelohi/database"
	// "github.com/darren/travelohi/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	// "github.com/gorilla/mux"
)

func GetDataByParam(c *fiber.Ctx, getBy string, dataClassType reflect.Type) error {
	abstractID := c.Params(getBy)

	dataClass := reflect.New(dataClassType).Interface()
	result := database.DB.First(dataClass, abstractID)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Data not found"})
	} else if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal Server Error"})
	}

	return c.JSON(dataClass)
}

func GetAllData(c *fiber.Ctx, dataClassType reflect.Type) error {
    dataSlice := reflect.New(reflect.SliceOf(dataClassType)).Interface()
    result := database.DB.Find(dataSlice)

    if result.Error != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal Server Error"})
    }

    return c.JSON(dataSlice)
}

func GetDataBySegment(c *fiber.Ctx, start, end int, dataClassType reflect.Type) error {
    dataSlice := reflect.New(reflect.SliceOf(dataClassType)).Interface()
    result := database.DB.Offset(start).Limit(end - start + 1).Find(dataSlice)

    if result.Error != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal Server Error"})
    }

    return c.JSON(dataSlice)
}



