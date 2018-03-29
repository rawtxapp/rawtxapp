package main

/*
#ifdef SWIG
%newobject InitLnd;
%newobject LndMain;
#endif
*/
import "C"
import (
	"fmt"
	"path/filepath"

	"github.com/lightningnetwork/lnd/channeldb"
)

var (
	channelDB              *channeldb.DB
	shutdownSuccessChannel = make(chan bool)
)

type Shutdown struct{}

/*

NOTE:
lnd.go is modified to remove the call to os.Hostname() in cert generation.
lnd.go is modified to send a value to shutdownSuccessChannel when it's done running.



MAYBE NOT:
lnd.go is modified to not expect a password for wallet encryption.

*/

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

//export StopLnd
func StopLnd() bool {
	shutdownRequestChannel <- Shutdown{}
	success := <-shutdownSuccessChannel
	return success
}

//export TestPanic
func TestPanic() {
	panic("Testing panic!")
}

//export StartLnd
func StartLnd() *C.char {
	defer func() {
		if x := recover(); x != nil {
			ltndLog.Errorf("run time panic: %v", x)
		}
	}()
	err := lndMain()
	if err != nil {
		return C.CString(err.Error())
	}
	return C.CString("")
}

// Mostly taken from lnd.go's lndMain() function.
// Should be kept in sync for most part except the RPC parts that are not needed.
func startLnd() error {
	// Create the network-segmented directory for the channel database.
	graphDir := filepath.Join(cfg.DataDir,
		defaultGraphSubDirname,
		normalizeNetwork(activeNetParams.Name))

	// Open the channeldb, which is dedicated to storing channel, and
	// network related metadata.
	chanDB, err := channeldb.Open(graphDir)
	if err != nil {
		ltndLog.Errorf("unable to open channeldb: %v", err)
		return err
	}
	channelDB = chanDB
	return nil
}

func stopLnd() error {
	channelDB.Close()
	return nil
}

func initLnd(lndHomeDir string) error {
	setDefaultVars(lndHomeDir)

	lndCfg, err := loadConfig()
	if err != nil {
		fmt.Println(err)
		return err
	}
	cfg = lndCfg
	/*
		ltndLog.Infof("Version %s", version())

		var network string
		switch {
		case cfg.Bitcoin.TestNet3 || cfg.Litecoin.TestNet3:
			network = "testnet"

		case cfg.Bitcoin.MainNet || cfg.Litecoin.MainNet:
			network = "mainnet"

		case cfg.Bitcoin.SimNet:
			network = "simmnet"

		case cfg.Bitcoin.RegTest:
			network = "regtest"
		}

		ltndLog.Infof("Active chain: %v (network=%v)",
			strings.Title(registeredChains.PrimaryChain().String()),
			network,
		)
	*/
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
