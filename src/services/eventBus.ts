import { EventEmitter } from 'events';

// Singleton Global Event Emitter for Node process
class GlobalMailEventBus extends EventEmitter {}

declare global {
  var mailEventBus: GlobalMailEventBus | undefined;
}

export const mailEventBus = globalThis.mailEventBus || new GlobalMailEventBus();

if (process.env.NODE_ENV !== 'production') {
  globalThis.mailEventBus = mailEventBus;
}
