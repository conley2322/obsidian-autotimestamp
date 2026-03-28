# Obsidian AutoTimestamp Plugin

An Obsidian plugin that automatically inserts timestamps when pressing Enter.

## Features

- Automatically adds timestamps when pressing Enter at the end of a line
- Customizable timestamp format
- Multiple timestamp styles (brackets, comment, parentheses, angle brackets, custom)
- File and folder pattern matching to control where timestamps are inserted
- Live preview of timestamp format
- Easy-to-use settings interface

## Installation

### From Obsidian Community Plugins

1. Open Obsidian
2. Go to Settings > Community plugins
3. Search for "AutoTimestamp"
4. Click "Install"
5. Click "Enable"

### From GitHub

1. Download the latest release from the [Releases](https://github.com/yourusername/obsidian-autotimestamp/releases) page
2. Extract the zip file to your Obsidian plugins folder: `{vault}/.obsidian/plugins/`
3. Restart Obsidian
4. Enable the plugin in Settings > Community plugins

## Usage

1. Open the plugin settings to configure:
   - Time format (e.g., `YYYY-MM-DD HH:mm:ss`)
   - Timestamp style (brackets, comment, etc.)
   - Custom wrapper symbols (if using custom style)
   - Folder and file patterns to control where timestamps are inserted

2. Start typing in a Markdown file
3. Press Enter at the end of a line - a timestamp will be automatically added

## Configuration

### Time Format

Supports the following placeholders:
- `YYYY` - 4-digit year
- `MM` - 2-digit month (01-12)
- `DD` - 2-digit day (01-31)
- `HH` - 2-digit hour (00-23)
- `mm` - 2-digit minute (00-59)
- `ss` - 2-digit second (00-59)

Example: `YYYY-MM-DD HH:mm:ss` → `2026-03-28 14:30:45`

### Timestamp Styles

- **Brackets**: ` [2026-03-28 14:30:45]`
- **Comment**: ` %%2026-03-28 14:30:45%%` (hidden in preview)
- **Parentheses**: ` (2026-03-28 14:30:45)`
- **Angle**: ` <2026-03-28 14:30:45>`
- **Custom**: Use your own wrapper symbols

### File and Folder Patterns

- **Folder patterns**: Control which folders get timestamps
  - Example: `Notes, Diary` → timestamps in Notes and Diary folders
  - Supports wildcards: `Notes/*` → all subfolders of Notes

- **File patterns**: Control which files get timestamps
  - Example: `*.md, todo-*` → timestamps in all Markdown files and files starting with "todo-"
  - Supports wildcards: `G*` → files starting with "G"

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Build for production: `npm run build`

### Testing

The plugin is tested in Obsidian v0.15.0+

## License

MIT

## Author

Conley

## Support

If you like this plugin, consider supporting the development:
- Star the repository on GitHub
- Leave a review in the Obsidian Community Plugins store
- Report bugs and suggest features in the [Issues](https://github.com/yourusername/obsidian-autotimestamp/issues) section