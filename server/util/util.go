package util

import (
    "math/rand"
	"fmt"
	"time"
)

func generateRandomCVV() string {
	rand.Seed(time.Now().UnixNano())
	minCVV := 100
	maxCVV := 999
	return fmt.Sprintf("%03d", rand.Intn(maxCVV-minCVV+1)+minCVV)
}