package models

import (
	"gorm.io/gorm"
	"time"
)

type CreditCard struct {
	gorm.Model
	CardNumber     string 
	SecurityCode   string
	ExpirationDate time.Time
	CardHolderName string
}
