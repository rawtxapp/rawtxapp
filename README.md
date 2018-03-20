# Exporting lnd to .so

go build -ldflags "-s -w" -x -v -o rtx_export.so -buildmode=c-shared **.go
https://github.com/vladimirvivien/go-cshared-examples
env GOOS=android GOARCH=x86_64 go build -ldflags "-s -w" -x -v -o rtx_export.so -buildmode=c-shared **.go

xgo -out rtx_export --targets=android/aar ./
go run !(*_test).go

scp -P 2222 user@127.0.0.1:/home/user/go/src/github.com/lightningnetwork/lnd/rtx_export-android-16.aar ./android/app/libs/rtx_export.aar

scp -P 2222 user@127.0.0.1:/home/user/go/src/github.com/lightningnetwork/lnd/rtx_*.go ./android/app/libs/rtx_export.aar
