package handler

import (
	"github.com/darren/travelohi/database"
	"github.com/darren/travelohi/models"
)

func CheckEmailExist(email string) bool {
	var user models.User
	database.DB.Where("email =?", email).First(&user)

	if user.ID == 0 {
		return false
	}

	return true
}