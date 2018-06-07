/* Created by "go tool cgo" - DO NOT EDIT. */

/* package github.com/lightningnetwork/lnd */


#line 1 "cgo-builtin-prolog"

#include <stddef.h> /* for ptrdiff_t below */

#ifndef GO_CGO_EXPORT_PROLOGUE_H
#define GO_CGO_EXPORT_PROLOGUE_H

typedef struct { const char *p; ptrdiff_t n; } _GoString_;

#endif

/* Start of preamble from import "C" comments.  */


#line 3 "/ext-go/1/src/github.com/lightningnetwork/lnd/rtx_config.go"

#ifdef SWIG
%newobject InitLnd;
#endif

#line 1 "cgo-generated-wrapper"

#line 3 "/ext-go/1/src/github.com/lightningnetwork/lnd/rtx_utils.go"

#include <stdlib.h>

#ifdef SWIG
%newobject GetEnv;
%newobject GetLndVersion;
#endif


#line 1 "cgo-generated-wrapper"


/* End of preamble from import "C" comments.  */


/* Start of boilerplate cgo prologue.  */
#line 1 "cgo-gcc-export-header-prolog"

#ifndef GO_CGO_PROLOGUE_H
#define GO_CGO_PROLOGUE_H

typedef signed char GoInt8;
typedef unsigned char GoUint8;
typedef short GoInt16;
typedef unsigned short GoUint16;
typedef int GoInt32;
typedef unsigned int GoUint32;
typedef long long GoInt64;
typedef unsigned long long GoUint64;
typedef GoInt64 GoInt;
typedef GoUint64 GoUint;
typedef __SIZE_TYPE__ GoUintptr;
typedef float GoFloat32;
typedef double GoFloat64;
typedef float _Complex GoComplex64;
typedef double _Complex GoComplex128;

/*
 static assertion to make sure the file is being used on architecture
 at least with matching size of GoInt.
 */
typedef char _check_for_64_bit_pointer_matching_GoInt[sizeof(void*)==64/8 ? 1:-1];

typedef _GoString_ GoString;
typedef void *GoMap;
typedef void *GoChan;
typedef struct { void *t; void *v; } GoInterface;
typedef struct { void *data; GoInt len; GoInt cap; } GoSlice;

#endif

/* End of boilerplate cgo prologue.  */

#ifdef __cplusplus
extern "C" {
#endif
  
  
  //InitLnd initializes lnd, lndHomeDir is coming from host app.
  // lndHomeDir could be for example in android /data/user/0/com.rtxwallet/files.
  
  extern char* InitLnd(char* p0);
  
  extern GoUint8 StopLnd();
  
  extern void TestPanic();
  
  extern char* StartLnd();
  
  extern char* GetEnv(char* p0);
  
  extern void SetEnv(char* p0, char* p1);
  
  extern char* GetLndVersion();
  
#ifdef __cplusplus
}
#endif

