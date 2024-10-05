package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Room struct {
	gorm.Model
	HotelId uint
	Type      string
	BaseMultiplier float32
	PicturesJSON datatypes.JSON
	FacilitiesJSON datatypes.JSON

	Hotel Hotel `gorm:"foreignKey:HotelId"`
}


// type Room struct {
// 	gorm.Model
// 	Type      string
// 	BaseMultiplier float32
// }
