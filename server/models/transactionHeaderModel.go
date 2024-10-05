package models

import (
	"gorm.io/gorm"
)

type TransactionHeader struct {
	gorm.Model
	UserId            uint
	PromoId           uint
	PaymentMethodName string
	PaymentAmountPaid string
	
	
	User              User `gorm:"foreignKey:UserId"`
	Promo             Promo `gorm:"foreignKey:PromoId"`
}
