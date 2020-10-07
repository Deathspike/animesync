# animekaizoku

AnimeKaizoku is capable of downloading anime episodes from popular streaming services. Each episode is downloaded in the original video format (often `h264` in a `mp4` container) and is then bundled alongside the subtitles into a `mkv` container. The episode files are named using a simple convention, for example `
A Certain Scientific Railgun 01 [CrunchyRoll].mkv`.

## Motivation

Streaming services allow watching *anime* in a *convenient* and *legal* way. However, offline episode availability requires service-specific applications that are miles behind the user experience of popular video applications. While understandable from a business perspective, the service-specific applications are annoying for end users. Please do not abuse this application; download episodes for **personal use** and **delete them** when you do not have an active subscription. Without our financial support, streaming services cannot exist.

## Legal Warning

This application is not endorsed or affliated with any streaming service. The usage of this application may be forbidden by law in your country. Usage of this application may cause a violation of *Terms of Service* between you and the streaming service. This application is not responsible for your actions.

# Prerequisites

* NodeJS >= 12 (http://nodejs.org/)
* NPM >= 6 (https://www.npmjs.org/)

# Install

## Debian (Mint, Ubuntu, etc)

0. (These instructions are currently untested; please contact me if you have issues)
1. Install *Chrome* following the instructions at https://www.google.com/chrome/
2. Run in *Terminal*: `sudo apt-get install ffmpeg mkvtoolnix nodejs npm`
3. Run in *Terminal*: `sudo npm install -g animekaizoku`

## Mac OS X

0. (These instructions are currently untested; please contact me if you have issues)
1. Install *Chrome* following the instructions at https://www.google.com/chrome/
2. Install *Homebrew* following the instructions at http://brew.sh/
3. Run in *Terminal*: `brew install ffmpeg mkvtoolnix node`
4. Run in *Terminal*: `npm install -g animekaizoku`

## Windows

1. Install *Chrome* following the instructions at https://www.google.com/chrome/
2. Install *NodeJS* following the instructions at http://nodejs.org/
3. Run in *Command Prompt*: `npm install -g animekaizoku`

# Update

## Debian (Mint, Ubuntu, etc)

1. Ensure that *AnimeKaizoku* is [installed](#Install)
2. Run in *Terminal*: `sudo npm update -g animekaizoku`

## Mac OS X

1. Ensure that *AnimeKaizoku* is [installed](#Install)
2. Run in *Terminal*: `npm update -g animekaizoku`

## Windows

1. Ensure that *AnimeKaizoku* is [installed](#Install)
2. Run in *Command Prompt*: `npm update -g animekaizoku`

# Streaming Services

The following streaming services are currently planned or supported:

* [CrunchyRoll](https://www.crunchyroll.com/)
* [Funimation](https://www.funimation.com/) (Coming Soon)

Requests to support additional streaming services are welcome.

# Usage

```
Usage: animekaizoku [options] [command]

Download anime episodes from popular streaming services.

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  browser         Launch browser.
  download        Downloads series.
  series          Manages series.
  help [command]  display help for command
```

## 1. Login

Streaming services often require an active subscription. Launch the browser:

    animekaizoku browser

This will launch the *Chrome* instance for `animekaizoku`. Then:

* Open your favourite streaming service website.
* Login to your account on the website.
* Close the browser.

## 2. Series

Series can now be added to `animekaizoku`. Add the series:

    animekaizoku series add https://www.crunchyroll.com/a-certain-scientific-railgun

## 3. Download

Episodes can now be downloaded. Download the episodes:

    animekaizoku download

Your episodes will be saved to the `animekaizoku` library, as shown in your console.

# Contributions

While software contributions are welcome, you can also help with:

* Documentation
* Helping other people
* Feature requests
* Bug reports

# Questions?

Please make an issue if you have questions, wish to request a feature, etc.
