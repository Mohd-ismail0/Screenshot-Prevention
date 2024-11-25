// src/index.ts
import { 
ScreenshotPreventionOptions, 
AttemptDetails, 
DetectionMethod,
PreventionElements,
PreventionState
} from './types';

class ScreenshotPrevention {
private static instance: ScreenshotPrevention | null = null;
private readonly state: PreventionState = {
    attemptCount: 0,
    isBlurred: false,
    recoveryTimer: null
};

private readonly options: Required<ScreenshotPreventionOptions> = {
    blurIntensity: '20px',
    warningMessage: 'Screenshot and screen recording are not allowed.',
    preventCopy: true,
    preventInspect: true,
    recoveryDelay: 2000,
    debug: false,
    onAttempt: this.defaultAttemptHandler.bind(this)
};

private readonly elements: PreventionElements = this.createElements();

constructor(options: ScreenshotPreventionOptions = {}) {
    if (ScreenshotPrevention.instance) {
    return ScreenshotPrevention.instance;
    }

    if (typeof window === 'undefined') {
    throw new Error('ScreenshotPrevention must be run in a browser environment');
    }

    ScreenshotPrevention.instance = this;

    // Merge provided options with defaults
    Object.assign(this.options, options);

    this.initializeOnce();
}

private createElements(): PreventionElements {
    return {
    overlay: this.createOverlay(),
    warning: this.createWarning(),
    style: this.createProtectiveStyles()
    };
}

private initializeOnce(): void {
    if (typeof document === 'undefined') return;

    const fragment = document.createDocumentFragment();
    
    fragment.appendChild(this.elements.overlay);
    fragment.appendChild(this.elements.warning);
    
    if (document.body) {
    requestAnimationFrame(() => {
        document.body.appendChild(fragment);
        document.head.appendChild(this.elements.style);
    });
    } else {
    document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(fragment);
        document.head.appendChild(this.elements.style);
    });
    }

    this.setupEventListeners();
}

private createOverlay(): HTMLDivElement {
    const overlay = document.createElement('div');
    overlay.className = 'screenshot-prevention-overlay';
    overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    backdrop-filter: blur(${this.options.blurIntensity});
    -webkit-backdrop-filter: blur(${this.options.blurIntensity});
    background: rgba(255, 255, 255, 0.5);
    z-index: 2147483647;
    display: none;
    transition: opacity 0.3s ease;
    pointer-events: none;
    `;
    return overlay;
}

private createWarning(): HTMLDivElement {
    const warning = document.createElement('div');
    warning.className = 'screenshot-prevention-warning';
    warning.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #ff4444;
    color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 2147483648;
    text-align: center;
    display: none;
    `;
    warning.textContent = this.options.warningMessage;
    return warning;
}

private createProtectiveStyles(): HTMLStyleElement {
    const style = document.createElement('style');
    if (this.options.preventCopy) {
    style.textContent = `
        .screenshot-prevention-active * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        }
    `;
    }
    return style;
}

private setupEventListeners(): void {
    const eventOptions: AddEventListenerOptions = { passive: true };
    
    document.addEventListener('keydown', this.handleKeyboardEvent.bind(this), eventOptions);
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this), eventOptions);
    
    if (navigator.mediaDevices) {
    navigator.mediaDevices.addEventListener('devicechange', 
        this.handleDeviceChange.bind(this), eventOptions);
    }

    const vv = window.visualViewport;
    if (vv instanceof VisualViewport) {
    vv.addEventListener('resize', 
        this.debounce(this.handleViewportResize.bind(this), 100), 
        eventOptions
    );
    }

    if (this.options.preventInspect) {
    this.preventInspection();
    }
}

private preventInspection(): void {
    document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
    });

    document.addEventListener('keydown', (e) => {
    const event = e as KeyboardEvent;
    if (
        (event.ctrlKey && event.shiftKey && event.key === 'I') ||
        (event.ctrlKey && event.shiftKey && event.key === 'C') ||
        (event.ctrlKey && event.key === 'U') ||
        event.key === 'F12'
    ) {
        event.preventDefault();
        return false;
    }
    });
}

private handleKeyboardEvent(e: KeyboardEvent): void {
    const screenshotKeys: Array<string> = ['3', '4', '5'];
    const isScreenshotCombo = (
    e.key === 'PrintScreen' ||
    ((e.metaKey || e.ctrlKey) && e.shiftKey && screenshotKeys.indexOf(e.key) !== -1) ||
    ((e.metaKey || (e as any).winKey) && e.shiftKey && e.key === 'S')
    );

    if (isScreenshotCombo) {
    e.preventDefault();
    this.handleDetection('Keyboard');
    }
}

private handleVisibilityChange(): void {
    if (document.hidden) {
    this.handleDetection('VisibilityChange');
    }
}

private handleDeviceChange(): void {
    this.handleDetection('DeviceChange');
}

private handleViewportResize(): void {
    if (this.isScreenshotResize()) {
    this.handleDetection('ViewportChange');
    }
}

private isScreenshotResize(): boolean {
    const vv = window.visualViewport;
    if (!(vv instanceof VisualViewport)) return false;
    
    const { width, height } = vv;
    const ratio = width / height;
    
    return ratio > 1.7 && ratio < 1.8;
}

private handleDetection(method: DetectionMethod): void {
    this.state.attemptCount++;

    if (this.state.recoveryTimer !== null) {
    window.clearTimeout(this.state.recoveryTimer);
    }

    requestAnimationFrame(() => {
    this.elements.overlay.style.display = 'block';
    this.elements.warning.style.display = 'block';
    document.body.classList.add('screenshot-prevention-active');
    });

    this.options.onAttempt({
    count: this.state.attemptCount,
    method,
    timestamp: Date.now()
    });

    this.state.recoveryTimer = window.setTimeout(() => {
    requestAnimationFrame(() => {
        this.elements.overlay.style.display = 'none';
        this.elements.warning.style.display = 'none';
        document.body.classList.remove('screenshot-prevention-active');
    });
    }, this.options.recoveryDelay);
}

private debounce<T extends (...args: any[]) => void>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: number | null = null;
    return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => fn.apply(this, args), delay);
    };
}

private defaultAttemptHandler(details: AttemptDetails): void {
    if (this.options.debug) {
    console.log('[ScreenshotPrevention]', details);
    }
}

// Public API
public getAttemptCount(): number {
    return this.state.attemptCount;
}

public reset(): void {
    this.state.attemptCount = 0;
    
    if (this.state.recoveryTimer !== null) {
    window.clearTimeout(this.state.recoveryTimer);
    this.state.recoveryTimer = null;
    }

    requestAnimationFrame(() => {
    this.elements.overlay.style.display = 'none';
    this.elements.warning.style.display = 'none';
    document.body.classList.remove('screenshot-prevention-active');
    });
}

public destroy(): void {
    if (this.state.recoveryTimer !== null) {
    window.clearTimeout(this.state.recoveryTimer);
    }

    this.elements.overlay.remove();
    this.elements.warning.remove();
    this.elements.style.remove();

    document.body.classList.remove('screenshot-prevention-active');
    ScreenshotPrevention.instance = null;
}

public update(options: Partial<ScreenshotPreventionOptions>): void {
    Object.assign(this.options, options);

    if (options.blurIntensity) {
    const blurValue = `blur(${options.blurIntensity})`;
    this.elements.overlay.style.setProperty('backdrop-filter', blurValue);
    this.elements.overlay.style.setProperty('-webkit-backdrop-filter', blurValue);
    }

    if (options.warningMessage) {
    this.elements.warning.textContent = options.warningMessage;
    }

    if (options.preventCopy !== undefined) {
    this.elements.style.textContent = options.preventCopy ? `
        .screenshot-prevention-active * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        }
    ` : '';
    }
}
}

export default ScreenshotPrevention;