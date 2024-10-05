package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	FirstName               string    `faker:"first_name"`
	LastName                string    `faker:"last_name"`
	Gender                  string    `faker:"gender"`
	Email                   string    `gorm:"unique" faker:"email"`
	Password                string    
	IsBanned                *bool   
	IsActivated             *bool      
	Age 					int
	Dob                     time.Time
	ProfilePicturePath      *string    `faker:"url"`
	HasUsedPromo            *bool     
	IsSubscribeToNewsLetter *bool      
	Role                    string    `faker:"word"`
	SecurityAnswerID        *uint
	SecurityAnswer          SecurityQuestion `gorm:"foreignKey:SecurityAnswerID"`
	SecurityAnswerString    string
	SecurityAnswerIndex	    int
	WalletBalance uint
	UsedPromoCode bool
}

