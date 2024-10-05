package models

type HotelFacilities struct {
	HotelId    uint
	FacilityId uint
	RoomId     uint

	Hotel      Hotel      `gorm:"foreignKey:HotelId"`
	Facilities Facilities `gorm:"foreignKey:FacilityId"`
	Room       Room       `gorm:"foreignKey:RoomId"`
}
