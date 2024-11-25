/**
 * @package enhanced-screenshot-prevention
 * @version 1.0.0
 * @description Advanced screenshot, screen recording, and screen sharing prevention library
 * @license MIT
 */

interface ScreenshotPreventionOptions {
    blurIntensity?: string;
    warningMessage?: string;
    preventCopy?: boolean;
    preventInspect?: boolean;
    recoveryDelay?: number;
    debug?: boolean;
    onAttempt?: (details: AttemptDetails) => void;
    customStyles?: Partial<UIStyles>;
}

interface AttemptDetails {
    count: number;
    method: DetectionMethod;
    timestamp: number;
    details?: string;
}

interface UIStyles {
    overlayBackground: string;
    warningBackground: string;
    warningColor: string;
    warningFontFamily: string;
    warningBorderRadius: string;
    warningBoxShadow: string;
}

type DetectionMethod = 
    | 'keyboard' 
    | 'mobile' 
    | 'screenCapture' 
    | 'mediaRecording' 
    | 'visibilityChange' 
    | 'devTools';

class EnhancedScreenshotPrevention {
    private static instance: EnhancedScreenshotPrevention | null = null;

    private readonly defaultStyles: UIStyles = {
        overlayBackground: 'rgba(255, 255, 255, 0.5)',
        warningBackground: '#ff4444',
        warningColor: '#ffffff',
        warningFontFamily: 'system-ui, -apple-system, sans-serif',
        warningBorderRadius: '8px',
        warningBoxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    };

    private readonly state = {
        attemptCount: 0,
        isBlurred: false,
        recoveryTimer: null as number | null,
        lastVisibilityChange: 0,
        mousePosition: { x: 0, y: 0 }
    };

    private readonly options: Required<ScreenshotPreventionOptions> = {
        blurIntensity: '20px',
        warningMessage: 'Screenshot and screen recording are not allowed.',
        preventCopy: true,
        preventInspect: true,
        recoveryDelay: 2000,
        debug: false,
        onAttempt: this.defaultAttemptHandler.bind(this),
        customStyles: {}
    };

    private readonly elements = {
        overlay: document.createElement('div'),
        warning: document.createElement('div'),
        style: document.createElement('style')
    };

    constructor(options: Partial<ScreenshotPreventionOptions> = {}) {
        if (EnhancedScreenshotPrevention.instance) {
            return EnhancedScreenshotPrevention.instance;
        }

        this.validateEnvironment();
        this.initializeOptions(options);
        this.initializeElements();

        EnhancedScreenshotPrevention.instance = this;
        this.initialize();

        return this;
    }

    private validateEnvironment(): void {
        if (typeof window === 'undefined') {
            throw new Error('EnhancedScreenshotPrevention requires a browser environment');
        }
    }

    private initializeOptions(options: Partial<ScreenshotPreventionOptions>): void {
        Object.assign(this.options, options);
        
        if (options.customStyles) {
            Object.assign(this.defaultStyles, options.customStyles);
        }
    }

    private initializeElements(): void {
        this.elements.overlay = this.createOverlay();
        this.elements.warning = this.createWarning();
        this.elements.style = this.createProtectiveStyles();
    }

    private initialize(): void {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    private setup(): void {
        const fragment = document.createDocumentFragment();
        fragment.appendChild(this.elements.overlay);
        fragment.appendChild(this.elements.warning);

        requestAnimationFrame(() => {
            document.body.appendChild(fragment);
            document.head.appendChild(this.elements.style);
            this.setupEventListeners();
            this.setupMediaProtection();
            
            if (this.options.preventInspect) {
                this.setupDevToolsDetection();
            }
        });
    }

    private createOverlay(): HTMLDivElement {
        const overlay = document.createElement('div');
        overlay.setAttribute('data-screenshot-prevention', 'overlay');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            backdrop-filter: blur(${this.options.blurIntensity});
            -webkit-backdrop-filter: blur(${this.options.blurIntensity});
            background: ${this.defaultStyles.overlayBackground};
            z-index: 2147483647;
            display: none;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        return overlay;
    }

    private createWarning(): HTMLDivElement {
        const warning = document.createElement('div');
        warning.setAttribute('data-screenshot-prevention', 'warning');
        warning.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${this.defaultStyles.warningBackground};
            color: ${this.defaultStyles.warningColor};
            padding: 20px;
            border-radius: ${this.defaultStyles.warningBorderRadius};
            font-family: ${this.defaultStyles.warningFontFamily};
            box-shadow: ${this.defaultStyles.warningBoxShadow};
            z-index: 2147483648;
            text-align: center;
            display: none;
            pointer-events: none;
        `;
        warning.textContent = this.options.warningMessage;
        return warning;
    }

    private createProtectiveStyles(): HTMLStyleElement {
        const style = document.createElement('style');
        style.textContent = `
            .screenshot-prevention-active * {
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
                user-select: none !important;
                -webkit-touch-callout: none !important;
            }
            
            @media print {
                body { display: none !important; }
            }
        `;
        return style;
    }

    private setupEventListeners(): void {
        const eventOptions = { passive: true };

        document.addEventListener('keydown', this.handleKeyboardEvent.bind(this), eventOptions);
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this), eventOptions);
        document.addEventListener('mousemove', this.handleMouseMove.bind(this), eventOptions);

        if ('visualViewport' in window && window.visualViewport) {
            window.visualViewport.addEventListener('resize', 
                this.debounce(this.handleViewportResize.bind(this), 100),
                eventOptions
            );
        }
    }

    private setupMediaProtection(): void {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
            navigator.mediaDevices.getDisplayMedia = async (...args: any[]) => {
                this.handleDetection('screenCapture', 'Screen capture attempted');
                throw new Error('Screen capture is not allowed');
            };
        }

        if ('mediaSession' in navigator && navigator.mediaSession) {
            navigator.mediaSession.setActionHandler('play', () => {
                this.handleDetection('mediaRecording', 'Media recording detected');
            });
        }
    }

    private setupDevToolsDetection(): void {
        const threshold = 160;
        let devToolsTimeout: number;

        const checkDevTools = () => {
            const windowWidth = window.outerWidth - window.innerWidth > threshold;
            const windowHeight = window.outerHeight - window.innerHeight > threshold;
            
            if (windowWidth || windowHeight) {
                this.handleDetection('devTools', 'Developer tools detected');
            }
        };

        window.addEventListener('resize', () => {
            window.clearTimeout(devToolsTimeout);
            devToolsTimeout = window.setTimeout(checkDevTools, 100);
        });
    }

    private handleKeyboardEvent(e: KeyboardEvent): void {
        const isWindowsKeyPressed = e.getModifierState('Meta') || e.getModifierState('OS');
        
        const isScreenshotCombo = 
            e.key === 'PrintScreen' ||
            ((e.metaKey || e.ctrlKey) && e.shiftKey && ['3', '4', '5'].includes(e.key)) ||
            ((e.metaKey || isWindowsKeyPressed) && e.shiftKey && e.key === 'S');

        if (isScreenshotCombo) {
            e.preventDefault();
            this.handleDetection('keyboard', 'Screenshot shortcut detected');
        }
    }

    private handleVisibilityChange(): void {
        const now = Date.now();
        const timeDiff = now - this.state.lastVisibilityChange;
        
        if (!document.hidden && timeDiff < 1000) {
            this.handleDetection('visibilityChange', 'Rapid visibility change detected');
        }
        
        this.state.lastVisibilityChange = now;
    }

    private handleMouseMove(e: MouseEvent): void {
        this.state.mousePosition = { x: e.clientX, y: e.clientY };
    }

    private handleViewportResize(): void {
        if (!window.visualViewport) return;

        const viewportWidth = window.visualViewport.width;
        const windowWidth = window.outerWidth;
        
        if (Math.abs(viewportWidth - windowWidth) > 50) {
            this.handleDetection('mobile', 'Mobile screenshot detected');
        }
    }

    private handleDetection(method: DetectionMethod, details?: string): void {
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
            timestamp: Date.now(),
            details
        });

        this.state.recoveryTimer = window.setTimeout(() => {
            requestAnimationFrame(() => {
                this.elements.overlay.style.display = 'none';
                this.elements.warning.style.display = 'none';
                document.body.classList.remove('screenshot-prevention-active');
            });
        }, this.options.recoveryDelay);
    }

    private defaultAttemptHandler(details: AttemptDetails): void {
        if (this.options.debug) {
            console.log('[EnhancedScreenshotPrevention]', details);
        }
    }

    private debounce<T extends (...args: any[]) => void>(
        fn: T,
        delay: number
    ): (...args: Parameters<T>) => void {
        let timeoutId: number;
        
        return (...args: Parameters<T>) => {
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => fn.apply(this, args), delay);
        };
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

    public update(options: Partial<ScreenshotPreventionOptions>): void {
        Object.assign(this.options, options);
        
        if (options.warningMessage) {
            this.elements.warning.textContent = options.warningMessage;
        }
        
        if (options.blurIntensity) {
            const blurValue = `blur(${options.blurIntensity})`;
            this.elements.overlay.style.setProperty('backdrop-filter', blurValue);
            this.elements.overlay.style.setProperty('-webkit-backdrop-filter', blurValue);
        }

        if (options.customStyles) {
            Object.assign(this.defaultStyles, options.customStyles);
            this.updateStyles();
        }
    }

    private updateStyles(): void {
        const { overlay, warning } = this.elements;
        
        overlay.style.background = this.defaultStyles.overlayBackground;
        
        Object.assign(warning.style, {
            background: this.defaultStyles.warningBackground,
            color: this.defaultStyles.warningColor,
            fontFamily: this.defaultStyles.warningFontFamily,
            borderRadius: this.defaultStyles.warningBorderRadius,
            boxShadow: this.defaultStyles.warningBoxShadow
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
        EnhancedScreenshotPrevention.instance = null;
    }
}

// Export for different module systems
if (typeof window !== 'undefined') {
    (window as any).EnhancedScreenshotPrevention = EnhancedScreenshotPrevention;
}

export default EnhancedScreenshotPrevention;