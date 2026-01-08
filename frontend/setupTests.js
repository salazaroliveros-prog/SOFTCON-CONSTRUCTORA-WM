import '@testing-library/jest-dom';

// Mock robusto de localStorage para entorno de test
if (typeof window !== 'undefined' && !window.localStorage) {
	let store = {};
	window.localStorage = {
		getItem: (key) => (key in store ? store[key] : null),
		setItem: (key, value) => { store[key] = value.toString(); },
		removeItem: (key) => { delete store[key]; },
		clear: () => { store = {}; },
		key: (i) => Object.keys(store)[i] || null,
		get length() { return Object.keys(store).length; },
	};
}

if (typeof global !== 'undefined' && !global.localStorage) {
	let store = {};
	global.localStorage = {
		getItem: (key) => (key in store ? store[key] : null),
		setItem: (key, value) => { store[key] = value.toString(); },
		removeItem: (key) => { delete store[key]; },
		clear: () => { store = {}; },
		key: (i) => Object.keys(store)[i] || null,
		get length() { return Object.keys(store).length; },
	};
}
