package models

import (
	"gorm.io/gorm"
)

type SearchHistory struct {
	gorm.Model
	Query  string
	UserId uint
	Type   string
	User   User `gorm:"foreignKey:UserId"`
}
