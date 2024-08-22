#!/bin/bash

export GOOS=linux
export GOARCH=amd64
export CGO_ENABLED=0
export GOFLAGS=-trimpath

go build -tags lambda.norpc -mod=readonly -ldflags="-s -w" -o ../sai/tf_generated/bootstrap ../../cmd/lambda/main.go
