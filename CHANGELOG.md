# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.4] - 2018-11-13
### Changed
- Updated to support regex forms from the CLI, to encourage ignoring through that method.
    - Anymatch globs doesn't match dotfiles by default and we can't control chokidar's ignore logic to turn on that flag. We encourage regex forms to circumvent this.

## [1.0.3] - 2018-11-13
### Changed
- Updated to avoid removing files in target directory when they match the ignore option.

## [1.0.2] - 2018-11-13
### Changed
- Fixed missing fs event for hardlink on updates by forcing utime on all hardlinks.

## [1.0.1] - 2018-11-13
### Changed
- Added quiet option and improved logging.
- Added folder validation to ensure no collisions and that the source is a folder.

## [1.0.0] - 2018-11-13
### Added
* Initial implementation
