package models

import (
	"time"

	"gorm.io/gorm"
)

type HotelReservation struct {
	gorm.Model
	HotelId      uint
	RoomId       uint
	CheckInDate  time.Time
	CheckOutDate time.Time
	BookingDays uint
	TotalPrice   float32

	Hotel Hotel `gorm:"foreignkey:HotelId"`
	Room Room `gorm:"foreignkey:RoomId"`
}
 