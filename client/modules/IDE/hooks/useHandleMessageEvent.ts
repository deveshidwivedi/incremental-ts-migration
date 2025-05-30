import { useDispatch } from 'react-redux';
import { Decode } from 'console-feed';
import { dispatchConsoleEvent } from '../actions/console';
import { stopSketch, expandConsole } from '../actions/ide';

// Type for the incoming message event data
interface SketchMessage {
  source?: string;
  messages?: Array<{ log: any }>;
  [key: string]: any;
}

// Safe stringify helper with types
function safeStringify(
  obj: any,
  depth = 0,
  maxDepth = 10,
  seen = new WeakMap()
): any {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (depth >= maxDepth) {
    if (seen.has(obj)) return '[Circular Reference]';
  }

  seen.set(obj, true);

  return Array.isArray(obj)
    ? obj.map((item) => safeStringify(item, depth + 1, maxDepth, seen))
    : Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
          key,
          safeStringify(value, depth + 1, maxDepth, seen)
        ])
      );
}

export default function useHandleMessageEvent() {
  const dispatch = useDispatch();

  const handleMessageEvent = (data: SketchMessage) => {
    if (!data || typeof data !== 'object') return;
    const { source, messages } = data;
    if (source !== 'sketch' || !Array.isArray(messages)) return;

    const decodedMessages = messages.map((message) => {
      try {
        const decoded = Decode(message.log) ?? '[Unknown Message]';
        return safeStringify(decoded);
      } catch (error) {
        console.error('Error decoding message:', error);
        return { error: 'Failed to decode message' };
      }
    });

    // Detect infinite loop warnings
    const hasInfiniteLoop = decodedMessages.some(
      (message: any) =>
        message?.data &&
        Object.values(message.data).some(
          (arg) =>
            typeof arg === 'string' &&
            arg.includes('Exiting potential infinite loop')
        )
    );

    if (hasInfiniteLoop) {
      dispatch(stopSketch());
      dispatch(expandConsole());
      return;
    }

    dispatch(dispatchConsoleEvent(decodedMessages));
  };

  return handleMessageEvent;
}
