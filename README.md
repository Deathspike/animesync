<p align="center">
  <i>AnimeSync</i> will be rebranded to <i>AnimeLoyalty</i> in the future.<br />
  None of the features will be lost.
</p>

# animesync

AnimeSync is capable of downloading anime episodes from popular streaming services. Each episode is downloaded in the original video format (often `h264` in a `mp4` container) and is then bundled alongside the subtitles into a `mkv` container. The episode files are named using a simple convention, for example `
A Certain Scientific Railgun 01 [CrunchyRoll].mkv`.

## Motivation

Streaming services allow watching *anime* in a *convenient* and *legal* way. However, offline episode availability requires service-specific applications that are miles behind the user experience of popular video applications. While understandable from a business perspective, the service-specific applications are annoying for end users. Please do not abuse this application; download episodes for **personal use** and **delete them** when you do not have an active subscription. Without our financial support, streaming services cannot exist.

## Legal Warning

This application is not endorsed or affliated with any streaming service. The usage of this application may be forbidden by law in your country. Usage of this application may cause a violation of *Terms of Service* between you and the streaming service. This application is not responsible for your actions.

# Prerequisites

* NodeJS >= 12 (http://nodejs.org/)
* NPM >= 6 (https://www.npmjs.org/)

# Install

## Windows

1. Install *Chrome* following the instructions at https://www.google.com/chrome/
2. Install *NodeJS* following the instructions at http://nodejs.org/
3. Run in *Command Prompt*: `npm install -g animesync`

## Mac

1. Install *Chrome* following the instructions at https://www.google.com/chrome/
2. Install *Homebrew* following the instructions at http://brew.sh/
3. Run in *Terminal*: `brew install node`
4. Run in *Terminal*: `npm install -g animesync`

## Linux (Mint, Ubuntu, etc)

1. Install *Chrome* following the instructions at https://www.google.com/chrome/
2. Run in *Terminal*: `sudo apt-get install nodejs npm`
3. Run in *Terminal*: `sudo npm install -g animesync`

# Update

## Windows

1. Ensure that `animesync` is [installed](#Install)
2. Run in *Command Prompt*: `npm install -g animesync`

## Mac

1. Ensure that `animesync` is [installed](#Install)
2. Run in *Terminal*: `npm install -g animesync`

## Linux (Mint, Ubuntu, etc)

1. Ensure that `animesync` is [installed](#Install)
2. Run in *Terminal*: `sudo npm install -g animesync`

# Streaming Services

The following streaming services are currently supported:

* [CrunchyRoll](https://www.crunchyroll.com/)
* [Funimation](https://www.funimation.com/)

Requests to support additional streaming services are welcome.

# Usage

```
Usage: animesync [options] [command]

AnimeSync is capable of downloading anime episodes from popular streaming services.

Options:
  -V, --version                      output the version number
  -h, --help                         display help for command

Commands:
  browser                            Launch browser.
  download [options] [seriesUrl...]  Downloads series.
  series                             Manage series.
  server                             Runs the server.
  settings [options]                 Manage settings.
  help [command]                     display help for command
```

## Basic Instructions

### Log In

Since streaming services require active subscriptions to access all content, you may want to log into your account. To access content, `animesync` uses a private instance of *Google Chrome*. This private instance does not share information with your normal instance, so even if you are already logged in there, `animesync` does not know of it. Launch the `animesync` browser instance:

    animesync browser

A *Google Chrome* window will appear. You will see a message at the top of the window, "Chrome is being controlled by automated test software". This indicates that `animesync` is connected and controlling the browser instance. Now you can use this browser instance to open the website of your streaming service, and log into your account. Once you're done, close the browser.

### Quick Download

To download a series, you can use:

    animesync download [seriesUrl...]

For example, to download *A Certain Scientific Railgun* from *CrunchyRoll*, you can use:

    animesync download https://www.crunchyroll.com/a-certain-scientific-railgun

It is recommended to add the series to your library if the series is ongoing.

### Your Library

To add a series to your library, you can use:

    animesync series add <seriesUrl> [rootPath]

For example, to add *A Certain Scientific Railgun* from *CrunchyRoll*, you can use:

    animesync series add https://www.crunchyroll.com/a-certain-scientific-railgun

To download all the series in your library, you can use:

    animesync download

To list all the series in your library, you can use:

    animesync series list

To remove a series from your library, you can use:

    animesync series remove <seriesUrl>

Please note that removing a series **does NOT delete** downloaded files.

### Filtering

To avoid downloading every episode, you can run:

    animesync download --skipDownload [seriesUrl...]

Which generates tracking files in the `.animesync` folder of your library. Just delete a tracking file and run `animesync download [seriesUrl...`] to download the missing episodes.

## User Settings

To check the settings, you can use:

    animesync settings

You will see something similar to:

```
Usage: animesync settings [options]

Manage settings.

Options:
  --chrome [string]                   Path to chrome-data.
                                      -> C:\Users\Deathspike\animesync\chrome-data
  --library [string]                  Path to library. Video files are stored here.
                                      -> C:\Users\Deathspike\animesync\library
  --sync [string]                     Path to sync. Temporary files are stored here.
                                      -> C:\Users\Deathspike\animesync\sync
  --chromeHeadless [bool]             Chrome headless mode.
                                      -> true
  --chromeInactiveTimeout [number]    Chrome inactive timeout in milliseconds.
                                      -> 1000
  --chromeNavigationTimeout [number]  Chrome navigation timeout in milliseconds.
                                      -> 30000
  --chromeObserverTimeout [number]    Chrome observation timeout in milliseconds.
                                      -> 30000
  --chromeViewport [string]           Chrome viewport while headless.
                                      ->⠀1920x974
  --proxyServer [string]              Proxy server for network traffic.
                                      ⠀⠀
  -h, --help                          display help for command
```

To change a setting, you can use an option flag. For example:

    animesync settings --chromeHeadless false

To remove a custom user setting, leave an option flag empty. For example:

    animesync settings --chromeHeadless 

### Proxy Server

Using a proxy server is supported in case you need to change region. For example:

    animesync settings --proxyServer https://example.com

Proxies often require authentication. You can use authentication like this:

    animesync settings --proxyServer https://username:password@example.com

You can use HTTP, HTTPS, SOCKS4 & SOCKS5 proxies. Examples:

* `http://example.com`
* `http://username:password@example.com`
* `https://example.com`
* `https://username:password@example.com`
* `socks4://example.com`
* `socks4://username:password@example.com`
* `socks5://example.com`
* `socks5://username:password@example.com`

Note that *CrunchyRoll* and *Funimation* are USA-based. So I recommend a USA-based proxy.

#### NordVPN

If you have an account with *NordVPN*, you can use:

    animesync settings --proxyServer nordvpn://username:password@us

With this configuration, `animesync` periodically queries the list of proxies provided by *NordVPN* and automatically selects the HTTPS proxy with the least amount of load. That should be the fastest proxy available at that time. The `@us` suffix stands for *USA*, and ensures the proxy server is in that country. You can use whatever country flag you desire, but I recommend *USA* for the best video availability.

## Developers

AnimeSync includes an `OpenAPI` server. You can run independently of downloads:

    animesync server

Then navigate to http://localhost:6583/. Questions? Please ask.

# Contributions

While software contributions are welcome, you can also help with:

* Documentation
* Helping other people
* Feature requests
* Bug reports

# Questions?

Please make an issue if you have questions, wish to request a feature, etc.
