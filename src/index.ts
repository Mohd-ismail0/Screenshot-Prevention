// Types
interface ScreenshotPreventionOptions {
    blurIntensity?: string;
    warningMessage?: string;
    preventCopy?: boolean;
    recoveryDelay?: number;
    debug?: boolean;
    onAttempt?: (details: AttemptDetails) => void;
}

interface AttemptDetails {
    count: number;
    method: DetectionMethod;
    timestamp: number;
}

type DetectionMethod = 'keyboard' | 'mobile' | 'visibility' | 'other';

class ScreenshotPrevention {
    private static instance: ScreenshotPrevention | null = null;
    
    // Class properties with initializers
    private readonly options: Required<ScreenshotPreventionOptions> = {
        blurIntensity: '10px',
        warningMessage: 'Screenshots are not allowed.',
        preventCopy: true,
        recoveryDelay: 2000,
        debug: false,
        onAttempt: this.defaultAttemptHandler.bind(this)
    };

    private readonly overlay: HTMLDivElement = this.createOverlay();
    private readonly warning: HTMLDivElement = this.createWarning();
    private attemptCount: number = 0;
    private recoveryTimer: number | null = null;

    constructor(options: ScreenshotPreventionOptions = {}) {
        // Singleton pattern
        if (ScreenshotPrevention.instance) {
            return ScreenshotPrevention.instance;
        }

        if (typeof window === 'undefined') {
            throw new Error('ScreenshotPrevention must be run in a browser environment');
        }

        // Merge provided options with defaults
        Object.assign(this.options, options);

        ScreenshotPrevention.instance = this;
        this.init();
    }

    private init(): void {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupElements());
        } else {
            this.setupElements();
        }
    }

    private setupElements(): void {
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.warning);

        if (this.options.preventCopy) {
            this.setupCopyPrevention();
        }

        this.setupEventListeners();
    }

    private createOverlay(): HTMLDivElement {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            backdrop-filter: blur(${this.options.blurIntensity});
            -webkit-backdrop-filter: blur(${this.options.blurIntensity});
            background: rgba(255, 255, 255, 0.5);
            z-index: 999999;
            display: none;
            pointer-events: none;
        `;
        return overlay;
    }

    private createWarning(): HTMLDivElement {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4444;
            color: white;
            padding: 20px;
            border-radius: 8px;
            font-family: sans-serif;
            z-index: 1000000;
            display: none;
            text-align: center;
            pointer-events: none;
        `;
        warning.textContent = this.options.warningMessage;
        return warning;
    }

    private setupEventListeners(): void {
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (
                e.key === 'PrintScreen' ||
                (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) ||
                ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'S')
            ) {
                e.preventDefault();
                this.handleScreenshotAttempt('keyboard');
            }
        });

        let lastTime = 0;
        document.addEventListener('visibilitychange', () => {
            const currentTime = Date.now();
            if (!document.hidden && currentTime - lastTime < 1000) {
                this.handleScreenshotAttempt('mobile');
            }
            lastTime = currentTime;
        });
    }

    private setupCopyPrevention(): void {
        const style = document.createElement('style');
        style.textContent = `
            body.prevent-copy * {
                user-select: none !important;
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
                -webkit-touch-callout: none !important;
            }
        `;
        document.head.appendChild(style);
        document.body.classList.add('prevent-copy');
    }

    private handleScreenshotAttempt(method: DetectionMethod): void {
        this.attemptCount++;

        if (this.recoveryTimer !== null) {
            window.clearTimeout(this.recoveryTimer);
        }

        this.overlay.style.display = 'block';
        this.warning.style.display = 'block';

        this.options.onAttempt({
            count: this.attemptCount,
            method,
            timestamp: Date.now()
        });

        this.recoveryTimer = window.setTimeout(() => {
            this.overlay.style.display = 'none';
            this.warning.style.display = 'none';
        }, this.options.recoveryDelay);
    }

    private defaultAttemptHandler(details: AttemptDetails): void {
        if (this.options.debug) {
            console.log('Screenshot attempt:', details);
        }
    }

    public getAttemptCount(): number {
        return this.attemptCount;
    }

    public reset(): void {
        this.attemptCount = 0;
        if (this.recoveryTimer !== null) {
            window.clearTimeout(this.recoveryTimer);
            this.recoveryTimer = null;
        }
        this.overlay.style.display = 'none';
        this.warning.style.display = 'none';
    }

    public destroy(): void {
        if (this.recoveryTimer !== null) {
            window.clearTimeout(this.recoveryTimer);
        }
        this.overlay.remove();
        this.warning.remove();
        document.body.classList.remove('prevent-copy');
        ScreenshotPrevention.instance = null;
    }

    public update(options: Partial<ScreenshotPreventionOptions>): void {
        Object.assign(this.options, options);
        
        if (options.warningMessage) {
            this.warning.textContent = options.warningMessage;
        }
        if (options.blurIntensity) {
            const blurValue = `blur(${options.blurIntensity})`;
            this.overlay.style.setProperty('backdrop-filter', blurValue);
            this.overlay.style.setProperty('-webkit-backdrop-filter', blurValue);
        }
    }
}

export default ScreenshotPrevention;