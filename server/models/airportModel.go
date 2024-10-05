package models

type Airport struct {
	Code string `gorm:"primarykey"`
	Name string
	City string
}