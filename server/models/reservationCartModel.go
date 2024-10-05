package models

import (
	"time"

	"gorm.io/gorm"
)

type ReservationCart struct {
	gorm.Model
	UserId              uint
	HotelReservationId  *uint
	FlightReservationId *uint
	ExpiredAt           time.Time
	Paid				bool


	User              User              `gorm:"foreignkey:UserId"`
	HotelReservation  HotelReservation  `gorm:"foreignkey:HotelReservationId"`
	FlightReservation FlightReservation `gorm:"foreignkey:FlightReservationId"`
}
