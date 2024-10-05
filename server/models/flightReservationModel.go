package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type FlightReservation struct {
	gorm.Model
	FlightScheduleId uint
	FlightClassId uint
	FlightSeatsReservationJson datatypes.JSON
	AddOnBaggageWeight uint
	AddOnBaggagePrice float32
	// IsAdult          bool


	FlightSchedule FlightSchedule `gorm:"foreignkey:FlightScheduleId"`
	FlightClass FlightClass `gorm:"foreignkey:FlightClassId"`
}
