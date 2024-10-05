package models

import "gorm.io/gorm"

type FlightSchedule struct {
	gorm.Model
	BasePrice        uint
	BaggageMaxWeight int
	CabinMaxWeight   int
	IsTransit 		 bool
}
