import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder and TextDecoder for jsdom
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;