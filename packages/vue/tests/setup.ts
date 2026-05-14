import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/"
});

const { window } = dom;

globalThis.window = window as unknown as typeof globalThis.window;
globalThis.document = window.document;
Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  writable: true,
  value: window.navigator
});
globalThis.HTMLElement = window.HTMLElement;
globalThis.Element = window.Element;
globalThis.Node = window.Node;
globalThis.SVGElement = window.SVGElement;
globalThis.MutationObserver = window.MutationObserver;
globalThis.getComputedStyle = window.getComputedStyle.bind(window);

if (!(globalThis as { requestAnimationFrame?: typeof requestAnimationFrame }).requestAnimationFrame) {
  globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
    return setTimeout(() => callback(Date.now()), 16) as unknown as number;
  }) as typeof requestAnimationFrame;
}

if (!(globalThis as { cancelAnimationFrame?: typeof cancelAnimationFrame }).cancelAnimationFrame) {
  globalThis.cancelAnimationFrame = ((handle: number) => {
    clearTimeout(handle);
  }) as typeof cancelAnimationFrame;
}
