package models

import (
	"time"
	"gorm.io/gorm"
)

type Flight struct {
	gorm.Model
	AirplaneId             string
	AirportOriginCode      string
	AirportDestinationCode string
	AirlineId              uint
	FlightScheduleId       uint
	FlightDuration         int
	FlightDepartureDate    time.Time
	FlightArrivalDate      time.Time
	BasePrice		       float32
	IsTransit              bool

	Airline 		     Airline  `gorm:"foreignKey:AirlineId"`
	Airplane             Airplane `gorm:"foreignKey:AirplaneId"`
	OriginAirport        Airport  `gorm:"foreignKey:AirportOriginCode"`
	DestinationAirport   Airport  `gorm:"foreignKey:AirportDestinationCode"`
}
