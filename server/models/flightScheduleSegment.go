package models

type FlightScheduleSegment struct {
	FlightScheduleId uint
	FlightId         uint
	SegmentOrder     int
	RestTimeMinutes  int

	Flight         Flight         `gorm:"foreignkey:FlightId"`
	FlightSchedule FlightSchedule `gorm:"foreignkey:FlightScheduleId"`
}
