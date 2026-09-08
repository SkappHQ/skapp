const JSDOMEnvironment = require("jest-environment-jsdom").default;

// jsdom does not implement the WHATWG fetch primitives, but next/server (pulled
// in by proxy.ts and anything importing it) subclasses Request at module scope.
// This environment runs in the Node realm, so it can hand the real
// implementations down to the jsdom global.
const NODE_GLOBALS = [
  "fetch",
  "Request",
  "Response",
  "Headers",
  "FormData",
  "ReadableStream",
  "WritableStream",
  "TransformStream",
  "BroadcastChannel",
  "MessagePort",
  "MessageChannel",
  "structuredClone"
];

class NextJsdomEnvironment extends JSDOMEnvironment {
  constructor(...args) {
    super(...args);

    for (const name of NODE_GLOBALS) {
      if (this.global[name] === undefined && globalThis[name] !== undefined) {
        this.global[name] = globalThis[name];
      }
    }
  }
}

module.exports = NextJsdomEnvironment;
