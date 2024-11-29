# Screenshot Prevention Library

A high-performance JavaScript library for preventing screenshots, screen recordings, and screen sharing in web applications. Built with TypeScript and zero dependencies.

## 🚀 Features

- **Screenshot Prevention**: Block common screenshot methods across all major platforms
- **Screen Recording Detection**: Identify and prevent screen recording attempts
- **Screen Sharing Protection**: Control screen sharing capabilities
- **Mobile Support**: Works on iOS and Android devices
- **High Performance**: Optimized for minimal performance impact
- **Customizable**: Flexible configuration options
- **TypeScript Support**: Full type definitions included
- **Zero Dependencies**: Lightweight and self-contained
- **Cross-Browser**: Support for all modern browsers

## 📦 Installation

### NPM
```bash
npm install screenshot-prevention
```

### Yarn
```bash
yarn add screenshot-prevention
```

### CDN
```html
<script src="screenshot-prevention.min.js"></script>
```

## 🔧 Quick Start

### Basic Usage
```html
<!-- Auto-initialize with default settings -->
<script src="screenshot-prevention.min.js" data-auto-init></script>
```

### Module Import
```javascript
import ScreenshotPrevention from 'screenshot-prevention';

const prevention = new ScreenshotPrevention({
  blurIntensity: '20px',
  warningMessage: 'Screenshots are not allowed on this website.',
  preventCopy: true
});
```

### TypeScript Usage
```typescript
import ScreenshotPrevention, { ScreenshotPreventionOptions } from 'screenshot-prevention';

const options: ScreenshotPreventionOptions = {
  blurIntensity: '20px',
  warningMessage: 'Screenshots are not allowed.',
  preventCopy: true,
  onAttempt: (details) => {
    console.log('Screenshot attempted:', details);
  }
};

const prevention = new ScreenshotPrevention(options);
```

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `blurIntensity` | string | '20px' | Blur intensity when prevention is triggered |
| `warningMessage` | string | 'Screenshot and screen recording are not allowed.' | Custom warning message |
| `preventCopy` | boolean | true | Prevent content copying |
| `preventInspect` | boolean | true | Prevent inspect element |
| `recoveryDelay` | number | 2000 | Recovery delay in milliseconds |
| `debug` | boolean | false | Enable debug logging |
| `onAttempt` | function | null | Callback for screenshot attempts |
| `customStyles` | object | {} | Custom UI styles |

## 🛠️ API Reference

### Methods

```typescript
// Get number of screenshot attempts
const attempts = prevention.getAttemptCount();

// Reset prevention state
prevention.reset();

// Update options
prevention.update({
  blurIntensity: '30px',
  warningMessage: 'New warning message'
});

// Clean up and remove
prevention.destroy();
```

### Events

The `onAttempt` callback receives an object with:
```typescript
interface AttemptDetails {
  count: number;        // Number of attempts
  method: string;       // Detection method used
  timestamp: number;    // Unix timestamp
  details?: string;     // Additional information
}
```

### Custom Styling

```typescript
const prevention = new ScreenshotPrevention({
  customStyles: {
    overlayBackground: 'rgba(0, 0, 0, 0.5)',
    warningBackground: '#ff0000',
    warningColor: '#ffffff',
    warningFontFamily: 'Arial, sans-serif',
    warningBorderRadius: '4px',
    warningBoxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  }
});
```

## 🌐 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 76+ |
| Firefox | 69+ |
| Safari | 13+ |
| Edge | 79+ |
| iOS Safari | 13.4+ |
| Chrome Android | 76+ |

## 🔒 Security Considerations

- The library uses multiple detection methods to ensure robust protection
- Implements measures against common bypass techniques
- Regular updates to address new screenshot methods
- CSP (Content Security Policy) compatible

## ⚠️ Limitations

- Cannot prevent hardware-based screenshots
- Some browser extensions may bypass protection
- Screen readers and accessibility tools may be affected
- Performance impact on low-end devices

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/username/screenshot-prevention.git

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 💡 Examples

### Basic Implementation
```javascript
const prevention = new ScreenshotPrevention();
```

### Custom Warning Message
```javascript
const prevention = new ScreenshotPrevention({
  warningMessage: 'Screenshots are not permitted for security reasons.',
  recoveryDelay: 3000
});
```

### Advanced Usage with Callbacks
```javascript
const prevention = new ScreenshotPrevention({
  blurIntensity: '25px',
  preventCopy: true,
  preventInspect: true,
  onAttempt: (details) => {
    console.log(`Screenshot attempted using ${details.method}`);
    logAttempt(details);
  }
});
```

## 🔍 Troubleshooting

### Common Issues

1. **Content Still Visible in Screenshots**
   - Ensure the library is properly initialized
   - Check if content is dynamically loaded
   - Verify z-index conflicts

2. **Performance Issues**
   - Reduce blur intensity
   - Disable unnecessary features
   - Check for conflicts with other libraries

3. **Mobile Detection Not Working**
   - Ensure proper viewport configuration
   - Check mobile browser compatibility
   - Verify touch event handling

### Debug Mode

Enable debug mode to log detailed information:
```javascript
const prevention = new ScreenshotPrevention({
  debug: true
});
```

## 📚 Additional Resources

- [API Documentation](docs/API.md)
- [Migration Guide](docs/MIGRATION.md)
- [Security Policy](SECURITY.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🤝 Support

For support, please:
1. Check the documentation
2. Search existing GitHub issues
3. Create a new issue if needed

## ✨ Credits

Created by Mohammed Ismail with the help of claude.ai
