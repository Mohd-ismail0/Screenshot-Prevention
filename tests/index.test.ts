import ScreenshotPrevention from '../src';

describe('ScreenshotPrevention', () => {
  let prevention: ScreenshotPrevention;
  
  beforeEach(() => {
    // Clear the DOM
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    
    // Reset singleton
    (ScreenshotPrevention as any).instance = null;
    
    // Create new instance
    prevention = new ScreenshotPrevention();
  });

  test('creates singleton instance', () => {
    const second = new ScreenshotPrevention();
    expect(second).toBe(prevention);
  });

  test('creates overlay element', () => {
    const overlay = document.querySelector('.screenshot-prevention-overlay');
    expect(overlay).toBeTruthy();
    expect(overlay?.tagName).toBe('DIV');
  });

  test('creates warning element', () => {
    const warning = document.querySelector('.screenshot-prevention-warning');
    expect(warning).toBeTruthy();
    expect(warning?.tagName).toBe('DIV');
  });

  test('detects print screen key', () => {
    const mockHandler = jest.fn();
    prevention = new ScreenshotPrevention({ onAttempt: mockHandler });
    
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'PrintScreen' }));
    
    expect(mockHandler).toHaveBeenCalledWith({
      count: 1,
      method: 'Keyboard',
      timestamp: expect.any(Number)
    });
  });

  test('resets attempt count', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'PrintScreen' }));
    expect(prevention.getAttemptCount()).toBe(1);
    
    prevention.reset();
    expect(prevention.getAttemptCount()).toBe(0);
  });
});