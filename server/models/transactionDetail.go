package models

type TransactionDetail struct {
    TransactionId uint
    HotelReservationId uint
	FlightReservationId uint

	TransactionHeader TransactionHeader `gorm:"foreignkey:TransactionId"`
	HotelReservation HotelReservation `gorm:"foreignkey:HotelReservationId"`
	FlightReservation FlightReservation `gorm:"foreignkey:FlightReservationId"`
}