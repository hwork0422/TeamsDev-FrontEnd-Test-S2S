// Suppress Fluent UI Northstar warnings that are known issues
// These warnings occur due to Fluent UI's use of deprecated React APIs

const originalWarn = console.warn;
const originalError = console.error;

// List of warning messages to suppress
const suppressedWarnings = [
  'findDOMNode is deprecated',
  'defaultProps will be removed from function components',
  'findDOMNode was passed an instance',
  'Slow network is detected',
];

// Override console.warn to filter out Fluent UI warnings
console.warn = (...args: any[]) => {
  const message = args.join(' ');
  const shouldSuppress = suppressedWarnings.some(warning => 
    message.includes(warning)
  );
  
  if (!shouldSuppress) {
    originalWarn.apply(console, args);
  }
};

// Override console.error to filter out Fluent UI errors
console.error = (...args: any[]) => {
  const message = args.join(' ');
  const shouldSuppress = suppressedWarnings.some(warning => 
    message.includes(warning)
  );
  
  if (!shouldSuppress) {
    originalError.apply(console, args);
  }
};

export {};
