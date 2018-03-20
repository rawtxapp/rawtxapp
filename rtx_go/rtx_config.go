package main

/*
#ifdef SWIG
%newobject InitLnd;
#endif
*/
import "C"
import (
	"fmt"
	"path/filepath"
)

//InitLnd initializes lnd, lndHomeDir is coming from host app.
// lndHomeDir could be for example in android /data/user/0/com.rtxwallet/files.
//export InitLnd
func InitLnd(lndHomeDir *C.char) *C.char {
	err := initLnd(C.GoString(lndHomeDir))
	if err != nil {
		return C.CString(err.Error())
	}
	return C.CString("")
}

func initLnd(lndHomeDir string) error {
	setDefaultVars(lndHomeDir)
	lndCfg, err := loadConfig()
	if err != nil {
		fmt.Println(err)
		return err
	}

	ltndLog.Infof("Version %s", version())
	return nil
}

func setDefaultVars(lndHomeDir string) {
	if lndHomeDir == "" {
		// If lndHomeDir is null, just leave the defaults as is.
		return
	}
	defaultLndDir = lndHomeDir
	defaultConfigFile = filepath.Join(defaultLndDir, defaultConfigFilename)
	defaultDataDir = filepath.Join(defaultLndDir, defaultDataDirname)
	defaultTLSCertPath = filepath.Join(defaultLndDir, defaultTLSCertFilename)
	defaultTLSKeyPath = filepath.Join(defaultLndDir, defaultTLSKeyFilename)
	defaultAdminMacPath = filepath.Join(defaultLndDir, defaultAdminMacFilename)
	defaultReadMacPath = filepath.Join(defaultLndDir, defaultReadMacFilename)
	defaultLogDir = filepath.Join(defaultLndDir, defaultLogDirname)

	defaultBtcdDir = filepath.Join(lndHomeDir, "btcd", "default")
	defaultBtcdRPCCertFile = filepath.Join(defaultBtcdDir, "rpc.cert")

	defaultLtcdDir = filepath.Join(lndHomeDir, "ltcd", "default")
	defaultLtcdRPCCertFile = filepath.Join(defaultLtcdDir, "rpc.cert")

	defaultBitcoindDir = filepath.Join(lndHomeDir, "bitcoin", "default")
	defaultLitecoindDir = filepath.Join(lndHomeDir, "litecoin", "default")
}
