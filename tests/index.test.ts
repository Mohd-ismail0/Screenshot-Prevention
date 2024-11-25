import EnhancedScreenshotPrevention from '../src';

describe('EnhancedScreenshotPrevention', () => {
  let prevention: EnhancedScreenshotPrevention;
  
  beforeEach(() => {
    // Reset the DOM
    document.body.innerHTML = '';
    // Reset any existing singleton instance
    (EnhancedScreenshotPrevention as any).instance = null;
    // Create new instance
    prevention = new EnhancedScreenshotPrevention();
  });

  afterEach(() => {
    prevention.destroy();
  });

  test('should create singleton instance', () => {
    const instance1 = new EnhancedScreenshotPrevention();
    const instance2 = new EnhancedScreenshotPrevention();
    expect(instance1).toBe(instance2);
  });

  test('should create overlay and warning elements', () => {
    const overlay = document.querySelector('[data-screenshot-prevention="overlay"]');
    const warning = document.querySelector('[data-screenshot-prevention="warning"]');
    
    expect(overlay).toBeTruthy();
    expect(warning).toBeTruthy();
  });

  test('should handle keyboard screenshot attempts', () => {
    const mockHandler = jest.fn();
    prevention = new EnhancedScreenshotPrevention({
      onAttempt: mockHandler
    });

    const event = new KeyboardEvent('keydown', {
      key: 'PrintScreen'
    });
    document.dispatchEvent(event);

    expect(mockHandler).toHaveBeenCalledWith(expect.objectContaining({
      method: 'keyboard',
      count: 1
    }));
  });

  test('should handle Mac screenshot shortcuts', () => {
    const mockHandler = jest.fn();
    prevention = new EnhancedScreenshotPrevention({
      onAttempt: mockHandler
    });

    const event = new KeyboardEvent('keydown', {
      key: '3',
      metaKey: true,
      shiftKey: true
    });
    document.dispatchEvent(event);

    expect(mockHandler).toHaveBeenCalledWith(expect.objectContaining({
      method: 'keyboard',
      count: 1
    }));
  });

  test('should track multiple attempts', () => {
    expect(prevention.getAttemptCount()).toBe(0);
    
    const event = new KeyboardEvent('keydown', { 
      key: 'PrintScreen' 
    });
    
    document.dispatchEvent(event);
    expect(prevention.getAttemptCount()).toBe(1);
    
    document.dispatchEvent(event);
    expect(prevention.getAttemptCount()).toBe(2);
  });

  test('should reset state correctly', () => {
    const event = new KeyboardEvent('keydown', { 
      key: 'PrintScreen' 
    });
    document.dispatchEvent(event);
    
    prevention.reset();
    
    expect(prevention.getAttemptCount()).toBe(0);
    const overlay = document.querySelector('[data-screenshot-prevention="overlay"]');
    const warning = document.querySelector('[data-screenshot-prevention="warning"]');
    
    expect(overlay).toBeTruthy();
    expect(warning).toBeTruthy();
    expect(overlay?.getAttribute('style')).toContain('display: none');
    expect(warning?.getAttribute('style')).toContain('display: none');
    expect(document.body.classList.contains('screenshot-prevention-active')).toBe(false);
  });

  test('should update options dynamically', () => {
    const newMessage = 'Custom warning message';
    const newBlurIntensity = '30px';
    
    prevention.update({
      warningMessage: newMessage,
      blurIntensity: newBlurIntensity
    });

    const warning = document.querySelector('[data-screenshot-prevention="warning"]');
    const overlay = document.querySelector('[data-screenshot-prevention="overlay"]');
    
    expect(warning?.textContent).toBe(newMessage);
    expect(overlay?.getAttribute('style')).toContain(`backdrop-filter: blur(${newBlurIntensity})`);
  });

  test('should clean up on destroy', () => {
    prevention.destroy();
    
    const overlay = document.querySelector('[data-screenshot-prevention="overlay"]');
    const warning = document.querySelector('[data-screenshot-prevention="warning"]');
    
    expect(overlay).toBeNull();
    expect(warning).toBeNull();
    expect(document.body.classList.contains('screenshot-prevention-active')).toBe(false);
  });

  test('should handle visibility changes', () => {
    const mockHandler = jest.fn();
    prevention = new EnhancedScreenshotPrevention({
      onAttempt: mockHandler
    });

    // Simulate rapid visibility changes
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'hidden', { value: true, writable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'hidden', { value: false, writable: true });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(mockHandler).toHaveBeenCalledWith(expect.objectContaining({
      method: 'visibilityChange'
    }));
  });
});