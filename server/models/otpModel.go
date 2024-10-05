package models

import (
	"time"

	"gorm.io/gorm"
)

type Otp struct {
	gorm.Model
	OtpCode   string
	Email     string
	ExpiresAt time.Time
	HasLoggedIn bool
}

func NewOtp(OtpCode, Email string, ExpiresAt time.Time, hasLoggedIn bool) *Otp {
	return &Otp{
		OtpCode:   OtpCode,
		Email:     Email,
		ExpiresAt: ExpiresAt,
		HasLoggedIn : hasLoggedIn,
	}
}
