package models

import "gorm.io/gorm"

type Promo struct {
	gorm.Model
	Percentage *float32
	Type       string
	Title      string
	Value      *int32
	ImagePath string
}
