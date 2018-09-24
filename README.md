[![GitHub license](https://img.shields.io/github/license/rawtxapp/rawtxapp.svg)](LICENSE)

# rawtx - lightning network wallet
rawtx is an open-source lightning network wallet powered by [lnd](https://github.com/lightningnetwork/lnd)
which allows you to send and receive Bitcoins both on blockchain and lightning network.

Here's what it looks like:
<br>
<p align='center'>
  <a href='https://rawtx.com'>
    <img src='https://raw.githubusercontent.com/rawtxapp/rawtxapp/master/docs/screenshot-1.jpg' height='400' alt='rawtx screenshot' />
  </a>
</p>

You can get it from [Play Store on Android](https://play.google.com/store/apps/details?id=com.rtxwallet)
or [App Store for iOS](https://itunes.apple.com/us/app/rawtx-lightning-wallet/id1397117908?ls=1&mt=8).

To get a high level overview of how the wallet works, check out [overview](docs/high_level_overview.md).

To compile from scratch, you can follow [building](docs/building.md).

# Support
If you run into issues, feel free to create an issue on Github, reach out
on twitter [@rawtxapp](twitter.com/rawtxapp) or send an email at support@rawtx.com.
You can also find us on [lnd slack](http://lightningcommunity.slack.com).

# Contributing
There's still a lot of work that needs to be done, if you know JS/Java or objC and
would like to contribute to the app/UI layer, here's a list of possible features. If
you know golang, you can head over to [lnd](https://github.com/lightningnetwork/lnd) to
contribute at the lightning layer.

Some TODOs/features:
* integrate autopilot,
* support streaming lnd APIs,
* litecoin integration,
* better UI for payments/invoices list screen,
* advanced/simple modes,
* possibility of pointing to remote node,
* satoshi, mbtc, US$ units for balances,
* dark theme,
* a specific activity just for handling **lightning:** links,
* translations.

# License
rawtxapp is MIT licensed, as found in the LICENSE file.