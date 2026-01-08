import '@testing-library/jest-dom';

// Mock robusto de localStorage para entorno de test
class LocalStorageMock {
	constructor() {
		this.store = {};
	}
	getItem(key) {
		return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
	}
	setItem(key, value) {
		this.store[key] = value.toString();
	}
	removeItem(key) {
		delete this.store[key];
	}
	clear() {
		this.store = {};
	}
	key(i) {
		return Object.keys(this.store)[i] || null;
	}
	get length() {
		return Object.keys(this.store).length;
	}
}

if (typeof window !== 'undefined') {
	window.localStorage = new LocalStorageMock();
}
if (typeof global !== 'undefined') {
	global.localStorage = new LocalStorageMock();
}
