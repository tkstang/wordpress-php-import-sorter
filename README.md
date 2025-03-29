# WordPress PHP Import Sorter

A Visual Studio Code extension that automatically sorts PHP imports according to [WordPress coding standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/#import-statements). This extension helps maintain consistent import ordering in your PHP files by following WordPress's guidelines for organizing imports by type and alphabetically.

## Features

- Follows WordPress coding standards for import organization
- Automatically sorts PHP imports alphabetically within their respective groups
- Groups imports by type (classes, functions, constants) with proper spacing
- Supports format-on-save functionality
- Preserves comments and whitespace
- Handles aliased imports
- Works with both namespaced and non-namespaced files
- Supports deeply nested namespaces
- Works alongside any other PHP formatter

### Import Sorting Rules

Following WordPress coding standards, imports are sorted according to these rules:

1. Imports are grouped by type in this order, with blank lines between groups:

   - Classes and interfaces
   - Functions
   - Constants

2. Within each group, imports are sorted by:
   - Namespace depth (shorter namespaces first)
   - Alphabetically within each namespace depth

For example:

```php
// Before sorting
use Project\Theme\Components\Button;
use Project\Theme\Config;
use Project\Theme\Components\Card;
use Project\Theme\Resources\PostType;
use Project\Theme\Helper;
use Project\Theme\Resources\Taxonomy;
use Project\Theme\Resources\User;
use Project\Theme\Resources\Comment;
use Project\Theme\Utils;
use Project\Theme\Components\Forms\ContactForm;
use Project\Theme\Components\Forms\LoginForm;

// After sorting
use Project\Theme\Config;
use Project\Theme\Helper;
use Project\Theme\Utils;
use Project\Theme\Components\Button;
use Project\Theme\Components\Card;
use Project\Theme\Resources\Comment;
use Project\Theme\Resources\PostType;
use Project\Theme\Resources\Taxonomy;
use Project\Theme\Resources\User;
use Project\Theme\Components\Forms\ContactForm;
use Project\Theme\Components\Forms\LoginForm;
```

The example above shows how:

1. Shorter namespace paths are sorted first (`Config`, `Helper`, `Utils`)
2. Then imports with one more namespace level are grouped (`Components\*` and `Resources\*`)
3. Finally, the deepest namespace paths are listed (`Components\Forms\*`)
4. Within each namespace depth, imports are sorted alphabetically

Here's another example showing sorting of different import types:

```php
// Before sorting
use ProjectClassB;
use function functionA;
use const CONSTANT_B;
use ProjectClassA;
use function functionB;
use const CONSTANT_A;

// After sorting
use ProjectClassA;
use ProjectClassB;

use function functionA;
use function functionB;

use const CONSTANT_A;
use const CONSTANT_B;
```

## Installation

1. Open Visual Studio Code
2. Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (macOS) to open the Quick Open dialog
3. Type `ext install tkstang.wordpress-php-import-sorter` and press Enter

## Usage

### Manual Sorting

1. Open a PHP file
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS) to open the Command Palette
3. Type "Sort PHP Imports" and press Enter

### Format on Save

The extension can automatically sort imports when you save PHP files. To enable this:

1. Open VS Code Settings (`Ctrl+,` or `Cmd+,`)
2. Search for "WordPress PHP Import Sorter"
3. Check the "Format On Save" option

Alternatively, you can add this to your `settings.json`:

```json
{
  "wordpress-php-import-sorter.formatOnSave": true
}
```

## Extension Settings

This extension contributes the following settings:

- `wordpress-php-import-sorter.formatOnSave`: Enable/disable automatic import sorting when saving PHP files (default: `true`)

## Requirements

- Visual Studio Code version 1.98.0 or higher
- PHP files in your workspace

## Known Issues

None at this time. If you encounter any issues, please report them on our [GitHub repository](https://github.com/tkstang/wordpress-php-import-sorter/issues).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This extension is licensed under the [MIT License](LICENSE).

## Release Notes

See [CHANGELOG.md](CHANGELOG.md) for all version updates and changes.

---

**Enjoy!**
