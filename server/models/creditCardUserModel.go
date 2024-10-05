package models

import "gorm.io/gorm"

type CreditCardUser struct {
	gorm.Model
	CreditCardId uint     
	UserId       uint       
	CreditCard   CreditCard `gorm:"foreignKey:CreditCardId"`
	User         User       `gorm:"foreignKey:UserId"`
}