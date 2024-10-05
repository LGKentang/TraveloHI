package models

import "gorm.io/gorm"

type Facilities struct {
	gorm.Model
	Name string
}
