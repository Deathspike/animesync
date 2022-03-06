# animesync

[![crunchyroll](https://github.com/Deathspike/animesync/actions/workflows/crunchyroll.yml/badge.svg)](https://github.com/Deathspike/animesync/actions/workflows/crunchyroll.yml)
[![crunchyrollBeta](https://github.com/Deathspike/animesync/actions/workflows/crunchyrollBeta.yml/badge.svg)](https://github.com/Deathspike/animesync/actions/workflows/crunchyrollBeta.yml)

AnimeSync is capable of downloading anime episodes from popular streaming services. Episodes are downloaded as `mkv` files containing the `h264` video and each subtitle. Metadata is downloaded as well, and includes posters and thumbnails. The metadata is compatible with *Jellyfin* and *Emby*.

## Motivation

Streaming services allow watching *anime* in a *convenient* and *legal* way. However, offline episode availability requires service-specific applications that are miles behind the user experience of popular video applications. While understandable from a business perspective, the service-specific applications are annoying for end users. Please do not abuse this application; download episodes for **personal use** and **delete them** when you do not have an active subscription. Without our financial support, streaming services cannot exist.

## Legal Warning

This application is not endorsed or affliated with any streaming service. The usage of this application may be forbidden by law in your country. Usage of this application may cause a violation of *Terms of Service* between you and the streaming service. This application is not responsible for your actions.

# Installation

AnimeSync can be installed on *Linux*, *Mac* and *Windows*:

1. Install *Chrome* following the instructions at https://www.google.com/chrome/
2. Install *NodeJS* following the instructions at http://nodejs.org/ (`node` >= 16, `npm` >= 7)
3. Run in *Command Prompt*/*Terminal*: `npm install -g animesync`

Repeat step three to update to the latest version.

# Streaming Services

The following streaming services are currently supported:

* [Crunchyroll](https://www.crunchyroll.com/)
* [Funimation](https://www.funimation.com/) (*Deprecated; See [#57](https://github.com/Deathspike/animesync/issues/57)*)
* [Vrv](https://vrv.co/) (*Deprecated; See [#57](https://github.com/Deathspike/animesync/issues/57)*)

# Usage

```
Usage: animesync [options] [command]

AnimeSync is capable of downloading anime episodes from popular streaming services.

Options:
  -V, --version                        output the version number
  -h, --help                           display help for command

Commands:
  download [options] [seriesUrl...]    Downloads series.
  update|add [options] [seriesUrl...]  Updates series.
  browser                              Launch browser.
  server                               Runs the server.
  settings                             Manage settings.
  help [command]                       display help for command
```

## Basic Instructions

### Authentication

Streaming services require paid subscriptions to access all content, so can provide `animesync` with your credentials.

#### Crunchyroll

To set your *Crunchyroll* credentials, you can use:

    animesync settings credential --crunchyrollUsername YOURUSER --crunchyrollPassword YOURPASS

### Download

To download a series, you can use:

    animesync download [seriesUrl...]

For example, to download *A Certain Scientific Railgun* from *Crunchyroll*, you can use:

    animesync download https://www.crunchyroll.com/a-certain-scientific-railgun

But if you're in the *Crunchyroll beta*, you have to use the *beta* page, so you can use:

    animesync download https://beta.crunchyroll.com/series/G649J4XPY/a-certain-scientific-railgun

To download a series into a different directory, you can use:

    animesync download --rootPath /path/of/the/directory [seriesUrl...]

To download missing episodes for all your series, you can use:

    animesync download

### Metadata

To add a series without downloading episodes, you can use:

    animesync add [seriesUrl...]
    
To update metadata for all your series, you can use:

    animesync update

### Filtering

To avoid downloading every episode, you can run:

    animesync download --skipDownload [seriesUrl...]

This generates tracker files in the `.animesync` directory. Delete one and run `animesync download` to download it.

## Settings

To check the settings, you can use:

    animesync settings

To check a settings section, you can use:

    animesync settings [section]

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
