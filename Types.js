/* @flow */

export type Wallet = {
  name: string,
  coin: "bitcoin",
  network: "testnet" | "mainnet",
  mode: "neutrino",
  neutrinoConnect: string,
  ix: number,
  usesKeychain: boolean
};
