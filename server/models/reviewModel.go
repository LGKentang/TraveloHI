package models

import (
	"gorm.io/gorm"
)

type Review struct {
	gorm.Model
	UserId            uint
	HotelId           uint
	Message           string
	IsAnonymous       bool
	CleanlinessRating int8
	ComformRating     int8
	LocationRating    int8
	ServiceRating     int8
	AverageRating     int8

	User  User  `gorm:"foreignKey:UserId"`
	Hotel Hotel `gorm:"foreignKey:HotelId"`
}
