import * as Keychain from "react-native-keychain";

export default class WalletKeychain {
  isKeychainEnabled = () => {
    return true;
  };

  setWalletPassword = async (walletIx, password) => {
    console.log("setting password for wallet ", walletIx);
    await Keychain.setGenericPassword("default", password, "wallet" + walletIx);
  };

  // Empty response means it failed to retrieve password.
  getWalletPassword = async walletIx => {
    console.log("getting password for ", walletIx);
    try {
      const { password } = await Keychain.getGenericPassword(
        "wallet" + walletIx
      );
      return password;
    } catch (err) {
      console.log(err);
      return "";
    }
  };
}
