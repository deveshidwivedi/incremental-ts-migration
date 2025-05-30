// Inspired by
// https://github.com/codesandbox/codesandbox-client/blob/master/packages/codesandbox-api/src/dispatcher/index.ts

type Frame = {
  frame: Window;
  origin: string;
};

type Frames = {
  [frameId: number]: Frame;
};

type Message = any; // You can define a stricter type if you know the message shape

type Listener = ((message: Message) => void) | null;

const frames: Frames = {};
let frameIndex = 1;
let listener: Listener = null;

export const MessageTypes = {
  START: 'START',
  STOP: 'STOP',
  FILES: 'FILES',
  SKETCH: 'SKETCH',
  REGISTER: 'REGISTER',
  EXECUTE: 'EXECUTE'
} as const;

export function registerFrame(newFrame: Window, newOrigin: string): () => void {
  const frameId = frameIndex;
  frameIndex += 1;
  frames[frameId] = { frame: newFrame, origin: newOrigin };
  return () => {
    delete frames[frameId];
  };
}

function notifyListener(message: Message): void {
  if (listener) listener(message);
}

function notifyFrames(message: Message): void {
  const rawMessage = JSON.parse(JSON.stringify(message));
  Object.keys(frames).forEach((frameId) => {
    const { frame, origin } = frames[Number(frameId)];
    if (frame && typeof frame.postMessage === 'function') {
      frame.postMessage(rawMessage, origin);
    }
  });
}

export function dispatchMessage(message: Message): void {
  if (!message) return;
  // notifyListener(message);
  notifyFrames(message);
}

/**
 * Call callback to remove listener
 */
export function listen(callback: (message: Message) => void): () => void {
  listener = callback;
  return () => {
    listener = null;
  };
}

function eventListener(e: MessageEvent): void {
  const { data } = e;
  if (data) {
    notifyListener(data);
  }
}

window.addEventListener('message', eventListener);
