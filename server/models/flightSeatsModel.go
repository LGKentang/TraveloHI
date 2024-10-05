package models

import "gorm.io/datatypes"

type FlightSeats struct {
	FlightID      uint
	FlightClassID uint
	SeatsJSON     datatypes.JSON

	Flight      Flight      `gorm:"foreignkey:FlightID"`
	FlightClass FlightClass `gorm:"foreignkey:FlightClassID"`
}
