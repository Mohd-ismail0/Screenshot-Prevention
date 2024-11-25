# Screenshot Prevention Library

A high-performance JavaScript library to prevent screenshots, screen recordings, and screen sharing on web applications.

## Features

- 🚫 Block screenshots and screen recordings
- 🖼️ Prevent screen sharing
- 📱 Mobile device support
- ⚡ High-performance implementation
- 🎨 Customizable UI and messaging
- 🔄 Automatic recovery
- 📦 Zero dependencies
- 💻 TypeScript support

## Installation

### NPM
```bash
npm install screenshot-prevention
```

### CDN
```html
<script src="https://cdn.jsdelivr.net/npm/screenshot-prevention@latest/dist/screenshot-prevention.min.js"></script>
```

## Quick Start

### Basic Usage
```html
<!-- Auto-initialize with default settings -->
<script src="screenshot-prevention.min.js" data-auto-init></script>
```

### Manual Initialization
```javascript
const prevention = new ScreenshotPrevention({
  blurIntensity: '20px',
  warningMessage: 'Screenshots are not allowed on this website.',
  preventCopy: true,
  preventInspect: true,
  recoveryDelay: 2000,
  onAttempt: (details) => {
    console.log('Screenshot attempted:', details);
  }
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| blurIntensity | string | '20px' | Blur intensity when prevention is triggered |
| warningMessage | string | 'Screenshot and screen recording are not allowed.' | Custom warning message |
| preventCopy | boolean | true | Prevent content copying |
| preventInspect | boolean | true | Prevent inspect element |
| recoveryDelay | number | 2000 | Recovery delay in milliseconds |
| debug | boolean | false | Enable debug logging |
| onAttempt | function | null | Callback for screenshot attempts |

## API Reference

### Methods

- `getAttemptCount()`: Get the number of screenshot attempts
- `reset()`: Reset the prevention state
- `destroy()`: Clean up and remove event listeners

### Events

The `onAttempt` callback receives an object with:
- `count`: Number of attempts
- `method`: Detection method used
- `timestamp`: Timestamp of the attempt

## Browser Support

- Chrome 76+
- Firefox 69+
- Safari 13+
- Edge 79+
- iOS Safari 13.4+
- Chrome for Android 76+

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Publishing Instructions

1. Create a new repository on GitHub
2. Initialize your local project:
   ```bash
   npm init
   git init
   ```

3. Set up your project structure:
   ```
   screenshot-prevention/
   ├── src/
   │   └── index.js
   ├── dist/
   │   ├── screenshot-prevention.js
   │   └── screenshot-prevention.min.js
   ├── examples/
   │   └── index.html
   ├── package.json
   ├── README.md
   ├── LICENSE
   └── .gitignore
   ```

4. Add build scripts to package.json:
   ```json
   {
     "scripts": {
       "build": "rollup -c",
       "test": "jest",
       "prepare": "npm run build"
     }
   }
   ```

5. Create and push to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/screenshot-prevention.git
   git push -u origin main
   ```

6. Publish to npm:
   ```bash
   npm login
   npm publish
   ```

7. Set up GitHub Actions for automated testing and publishing:
   ```yaml
   name: CI/CD
   on: [push, pull_request]
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
         - run: npm ci
         - run: npm test
         - run: npm run build
   ```

## License

MIT License - free for commercial and personal use.

## Support

- GitHub Issues: [Report a bug](https://github.com/Mohd-ismail0/screenshot-prevention/issues)
- Email: md.13ismail@gmail.com