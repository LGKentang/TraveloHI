package models

type BankingUser struct {
	UserId        uint
	BankId        uint
	AccountNumber string

	User User `gorm:"foreignKey:UserId"`
	Bank Bank `gorm:"foreignKey:BankId"`
}
