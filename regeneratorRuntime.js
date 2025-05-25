// Import just the runtime directly to avoid any circular dependencies
import 'regenerator-runtime/runtime'

// Import core-js for modern JavaScript features
import 'core-js/stable';

// Make regeneratorRuntime globally available if needed
if (typeof global.regeneratorRuntime === 'undefined') {
    const regeneratorRuntime = require('regenerator-runtime');
    global.regeneratorRuntime = regeneratorRuntime;
}

// Polyfill FinalizationRegistry if not available
if (typeof global.FinalizationRegistry === 'undefined') {
    global.FinalizationRegistry = class FinalizationRegistry {
        constructor(callback) {
            this.callback = callback;
        }
        register() {}
        unregister() {}
    };
} 