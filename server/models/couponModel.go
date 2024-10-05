package models

import "gorm.io/gorm"

type Coupon struct {
	gorm.Model
	ClaimText string
	Value     float32
}
