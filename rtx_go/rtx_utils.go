package main

/*
#include <stdlib.h>

#ifdef SWIG
%newobject GetEnv;
%newobject GetLndVersion;
#endif

*/
import "C"
import (
	"os"
)

//export GetEnv
func GetEnv(v *C.char) *C.char {
	return C.CString(os.Getenv(C.GoString(v)))
}

//export SetEnv
func SetEnv(key *C.char, val *C.char) {
	os.Setenv(C.GoString(key), C.GoString(val))
}

//export GetLndVersion
func GetLndVersion() *C.char {
	return C.CString(version())
}
