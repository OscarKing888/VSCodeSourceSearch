# Source Search Extension for VSCode

A powerful code search tool for VSCode, similar to Entrian Source Search. This extension provides fast and efficient code searching capabilities within your workspace.

## Features

- Fast file content search
- Search history
- Results displayed in a dedicated panel
- Support for multiple file types
- Regular expression support (coming soon)
- File filtering (coming soon)

## Usage

1. Press `Ctrl+Shift+F` (Windows/Linux) or `Cmd+Shift+F` (Mac) to open the search panel
2. Enter your search text in the input field
3. Press Enter or click the Search button
4. Results will be displayed in the panel below
5. Click on any result to navigate to the file and line

## Supported File Types

- TypeScript (.ts)
- JavaScript (.js)
- HTML (.html)
- CSS (.css)
- JSON (.json)
- Markdown (.md)

## Installation

1. Clone this repository
2. Run `npm install`
3. Press F5 to start debugging
4. The extension will be installed in a new VSCode window

## Development

- `npm install` - Install dependencies
- `npm run compile` - Compile the extension
- `npm run watch` - Watch for changes and compile
- `npm run test` - Run tests
- `npm install -g @vscode/vsce` - Install vsce globally
- `vsce package` - Package the extension
- `Set-ExecutionPolicy RemoteSigned` - Set the execution policy to allow the extension to be installed
- `npx vsce package` - Package the extension
- `code --install-extension <path-to-extension>` - Install the extension

## License

MIT License - See LICENSE file for details