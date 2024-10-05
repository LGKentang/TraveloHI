package models

import (
	"gorm.io/datatypes"


	"gorm.io/gorm"
)

type Hotel struct {
	gorm.Model
	Name            string
	Rating          float32
	Description     string
	MainImagePath		string
	PicturePathJSON datatypes.JSON 
	MainFacilitiesJSON datatypes.JSON
	Address         string
	SearchCount		uint
	Stars 			int
	BasePrice       float32
	AvailableRooms uint
}
