package models

import "gorm.io/gorm"

type SecurityQuestion struct {
	gorm.Model
	TotalSecurityQuestion int
	SecurityAnswer1       string
	SecurityAnswer2       string
	SecurityAnswer3       string
	SecurityAnswer4       string
	SecurityAnswer5       string
}