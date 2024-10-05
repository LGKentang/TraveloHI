package models

import "gorm.io/gorm"

type FlightClass struct {
	gorm.Model
	Name string
}
