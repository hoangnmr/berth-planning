// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
// Polyfill TextEncoder/TextDecoder for tests (used by jspdf internals)
const util = require('util');
global.TextEncoder = global.TextEncoder || util.TextEncoder;
global.TextDecoder = global.TextDecoder || util.TextDecoder;
