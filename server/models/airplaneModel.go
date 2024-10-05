package models

type Airplane struct {
	AirplaneCode string `gorm:"primarykey"`
	Manufacturer string 
	SeatRows     int
	SeatCols     int

}

