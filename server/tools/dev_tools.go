//go:build tools

package tools

//go:generate go build -o ../bin/air github.com/air-verse/air

import (
	_ "github.com/air-verse/air"
)
