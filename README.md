# animesync

AnimeSync is capable of downloading anime episodes from popular streaming services. Each episode is downloaded in the original video format (often `h264` in a `mp4` container) and is then bundled alongside the subtitles into a `mkv` container. The episode files are named using a simple convention, for example `
A Certain Scientific Railgun 01 [AnimeSync].mkv`.

## Motivation

Streaming services allow watching *anime* in a *convenient* and *legal* way. However, offline episode availability requires service-specific applications that are miles behind the user experience of popular video applications. While understandable from a business perspective, the service-specific applications are annoying for end users. Please do not abuse this application; download episodes for **personal use** and **delete them** when you do not have an active subscription. Without our financial support, streaming services cannot exist.

## Legal Warning

This application is not endorsed or affliated with any streaming service. The usage of this application may be forbidden by law in your country. Usage of this application may cause a violation of *Terms of Service* between you and the streaming service. This application is not responsible for your actions.

# Install

## Windows

1. Install *Chrome* following the instructions at https://www.google.com/chrome/
2. Install *NodeJS* following the instructions at http://nodejs.org/ (`node` >= 14, `npm` >= 6)
3. Run in *Command Prompt*: `npm install -g animesync`

## Mac

1. Install *Chrome* following the instructions at https://www.google.com/chrome/
2. Install *NodeJS* following the instructions at http://nodejs.org/ (`node` >= 14, `npm` >= 6)
3. Run in *Terminal*: `npm install -g animesync`

## Linux (Debian, Ubuntu, Mint)

1. Install *Chrome* following the instructions at https://www.google.com/chrome/
2. Install *NodeJS* following the instructions at http://nodejs.org/ (`node` >= 14, `npm` >= 6)
3. Run in *Terminal*: `sudo apt-get install ffmpeg`
4. Run in *Terminal*: `npm install -g animesync`

# Update

## Windows

1. Ensure that `animesync` is [installed](#Install)
2. Run in *Command Prompt*: `npm install -g animesync`

## Mac

1. Ensure that `animesync` is [installed](#Install)
2. Run in *Terminal*: `npm install -g animesync`

## Linux (Debian, Ubuntu, Mint)

1. Ensure that `animesync` is [installed](#Install)
2. Run in *Terminal*: `npm install -g animesync`

# Streaming Services

The following streaming services are currently supported:

* [Crunchyroll](https://www.crunchyroll.com/)
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
  server                             Runs the server.
  settings [options]                 Manage settings.
  help [command]                     display help for command
```

## Basic Instructions

### Log In

Since streaming services require active subscriptions to access all content, you may want to log into your account. To access content, `animesync` uses a private instance of *Google Chrome*. This private instance does not share information with your normal instance, so even if you are already logged in there, `animesync` does not know of it. To launch *Google Chrome* and manually log in, you can use:

    animesync browser

You will see a message at the top of the window, "Chrome is being controlled by automated test software". This indicates that `animesync` is connected and controlling the browser instance. This approach works, but both *Crunchyroll* and *Funimation* occassionally log you out. To prevent that, `animesync` can be configured with credentials and log in on your behalf.

#### Crunchyroll

To set your *Crunchyroll* credentials, you can use:

    animesync settings credential --crunchyrollUsername YOURUSER --crunchyrollPassword YOURPASS

#### Funimation

To set your *Funimation* credentials, you can use:

    animesync settings credential --funimationUsername YOURUSER --funimationPassword YOURPASS

### Download

To download a series, you can use:

    animesync download [seriesUrl...]

For example, to download *A Certain Scientific Railgun* from *Crunchyroll*, you can use:

    animesync download https://www.crunchyroll.com/a-certain-scientific-railgun

To use a different destination directory, you can use:

    animesync download --rootPath /path/of/the/directory https://www.crunchyroll.com/a-certain-scientific-railgun

When you want to download new episodes, you can use:

    animesync download

### Filtering

To avoid downloading every episode, you can run:

    animesync download --skipDownload [seriesUrl...]

Which generates tracking files in the `.animesync` directory. Just delete a tracking file and run `animesync download` to download the missing episodes.

## User Settings

To check the settings, you can use:

    animesync settings

You will see something similar to:

```
Usage: animesync settings [options] [command]

Manage settings.

Options:
  -h, --help            display help for command

Commands:
  core [options]        The core settings.
  credential [options]  The credential settings.
  path [options]        The path settings.
  help [command]        display help for command
```

Each section holds its own settings that can be configured. For example, `core` has these values:

```
Usage: app settings core [options]

The core settings.

Options:
  --chromeHeadless [bool]             Chrome headless mode.
                                      -> true
  --chromeInactiveTimeout [number]    Chrome inactive timeout in milliseconds.
                                      -> 600000
  --chromeNavigationTimeout [number]  Chrome navigation timeout in milliseconds.
                                      -> 30000
  --chromeViewport [string]           Chrome viewport while headless.
                                      -> 1920x974
  --fetchMaximumRetries [number]      Fetch maximum retries.
                                      -> 8
  --fetchTimeoutRequest [number]      Fetch request timeout in milliseconds.
                                      -> 30000
  --fetchTimeoutRetry [number]        Fetch retry timeout in milliseconds.
                                      -> 3750
  --ffmpeg [string]                   Path to custom ffmpeg executable.
                                      ->
  --proxyServer [string]              Proxy server for network traffic.
                                      ->
  -h, --help                          display help for command
```

To change a setting, you can use an option flag. For example:

    animesync settings core --chromeHeadless false

To remove a custom user setting, leave an option flag empty. For example:

    animesync settings core --chromeHeadless 

### Proxy Server

Using a proxy server is supported in case you need to change region. For example:

    animesync settings core --proxyServer https://example.com

Proxies often require authentication. You can use authentication like this:

    animesync settings core --proxyServer https://username:password@example.com

You can use HTTP, HTTPS, SOCKS4 & SOCKS5 proxies. Examples:

* `http://example.com`
* `http://username:password@example.com`
* `https://example.com`
* `https://username:password@example.com`
* `socks4://example.com`
* `socks4://username:password@example.com`
* `socks5://example.com`
* `socks5://username:password@example.com`

Note that *Crunchyroll* and *Funimation* are USA-based. So I recommend a USA-based proxy.

#### NordVPN

If you have an account with *NordVPN*, you can use:

    animesync settings core --proxyServer nordvpn://username:password@us

With this configuration, `animesync` periodically queries the list of proxies provided by *NordVPN* and automatically selects the HTTPS proxy with the least amount of load. That should be the fastest proxy available at that time. The `@us` suffix stands for *USA*, and ensures the proxy server is in that country. You can use whatever country flag you desire, but I recommend *USA* for the best video availability.

## Developers

AnimeSync includes an `OpenAPI` server. You can run independently of downloads:

    animesync server

Then navigate to http://127.0.0.1:6583/. Questions? Please ask.

# Contributions

While software contributions are welcome, you can also help with:

* Documentation
* Helping other people
* Feature requests
* Bug reports

# Questions?

Please make an issue if you have questions, wish to request a feature, etc.
