import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import EnhancedScreenshotPrevention from '../src/index';

describe('EnhancedScreenshotPrevention', () => {
  let prevention: EnhancedScreenshotPrevention;
  let mockHandler: jest.Mock;

  beforeEach(() => {
    // Setup DOM environment
    document.body.innerHTML = '';
    
    // Mock requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    // Mock setTimeout
    jest.spyOn(window, 'setTimeout').mockImplementation((cb) => {
      return 0 as any;
    });

    // Create mock handler
    mockHandler = jest.fn();
    
    // Initialize prevention with mock handler
    prevention = new EnhancedScreenshotPrevention({
      onAttempt: mockHandler,
      debug: true
    });
  });

  afterEach(() => {
    prevention.destroy();
    jest.clearAllMocks();
  });

  it('should create singleton instance', () => {
    const instance1 = new EnhancedScreenshotPrevention();
    const instance2 = new EnhancedScreenshotPrevention();
    expect(instance1).toBe(instance2);
  });

  it('should create overlay and warning elements', () => {
    // Force DOM content loaded
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    // Wait for next frame
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        const overlay = document.querySelector('[data-screenshot-prevention="overlay"]');
        const warning = document.querySelector('[data-screenshot-prevention="warning"]');
        
        expect(overlay).toBeTruthy();
        expect(warning).toBeTruthy();
        resolve(undefined);
      });
    });
  });

  it('should handle keyboard screenshot attempts', () => {
    // Force initialization
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    const event = new KeyboardEvent('keydown', {
      key: 'PrintScreen',
      bubbles: true
    });
    
    document.dispatchEvent(event);
    
    expect(mockHandler).toHaveBeenCalledWith(expect.objectContaining({
      method: 'keyboard',
      count: 1
    }));
  });

  it('should handle Mac screenshot shortcuts', () => {
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    const event = new KeyboardEvent('keydown', {
      key: '3',
      metaKey: true,
      shiftKey: true,
      bubbles: true
    });
    
    document.dispatchEvent(event);
    
    expect(mockHandler).toHaveBeenCalledWith(expect.objectContaining({
      method: 'keyboard',
      count: 1
    }));
  });

  it('should track multiple attempts', () => {
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    const event = new KeyboardEvent('keydown', {
      key: 'PrintScreen',
      bubbles: true
    });

    document.dispatchEvent(event);
    expect(prevention.getAttemptCount()).toBe(1);

    document.dispatchEvent(event);
    expect(prevention.getAttemptCount()).toBe(2);
  });

  it('should reset state correctly', () => {
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    // Trigger detection
    const event = new KeyboardEvent('keydown', {
      key: 'PrintScreen',
      bubbles: true
    });
    document.dispatchEvent(event);

    // Reset state
    prevention.reset();

    const overlay = document.querySelector('[data-screenshot-prevention="overlay"]') as HTMLElement;
    const warning = document.querySelector('[data-screenshot-prevention="warning"]') as HTMLElement;

    expect(overlay).toBeTruthy();
    expect(warning).toBeTruthy();
    expect(overlay?.style.display).toBe('none');
    expect(warning?.style.display).toBe('none');
    expect(prevention.getAttemptCount()).toBe(0);
  });

  it('should update options dynamically', () => {
    const prevention = new EnhancedScreenshotPrevention();
    const newMessage = 'Updated warning message';
    const newBlurIntensity = '30px';

    // Get references to the elements
    const warning = document.querySelector('[data-screenshot-prevention="warning"]');
    const overlay = document.querySelector('[data-screenshot-prevention="overlay"]') as HTMLElement;

    // Update options
    prevention.update({
      warningMessage: newMessage,
      blurIntensity: newBlurIntensity
    });

    // Check warning message update
    expect(warning?.textContent).toBe(newMessage);

    // Check blur intensity updates
    expect(overlay?.style.backdropFilter).toBe(`blur(${newBlurIntensity})`);
    expect(overlay?.style.backdropFilter).toBe(`blur(${newBlurIntensity})`);
  });
})