import loopProtect from 'loop-protect';
import { Hook, Decode, Encode, Log } from 'console-feed';
import StackTrace, { StackFrame } from 'stacktrace-js';
import evaluateExpression from './evaluateExpression';

// should postMessage user the dispatcher? does the parent window need to
// be registered as a frame? or a just a listener?

// could maybe send these as a message idk
// const { editor } = window;
const editor: Window = (window.parent?.parent ?? window.parent) as Window;
const { editorOrigin } = window as any;
const htmlOffset = 12;

// Extend window type for custom properties
declare global {
  interface Window {
    objectUrls: Record<string, string>;
    objectPaths: Record<string, string>;
    loopProtect: typeof loopProtect;
    p5?: { _report?: (message: string, method: string, color: string) => void };
  }
}

// Ensure objectUrls and objectPaths exist
window.objectUrls = window.objectUrls || {};
window.objectPaths = window.objectPaths || {};

window.objectUrls[window.location.href] = '/index.html';
const blobPath = window.location.href.split('/').pop()!;
window.objectPaths[blobPath] = 'index.html';

window.loopProtect = loopProtect;

const consoleBuffer: { log: Log }[] = [];
const LOGWAIT = 500;
Hook(window.console, (log: Log) => {
  consoleBuffer.push({ log });
});
setInterval(() => {
  if (consoleBuffer.length > 0) {
    const message = {
      messages: [...consoleBuffer],
      source: 'sketch'
    };
    editor.postMessage(message, editorOrigin);
    consoleBuffer.length = 0;
  }
}, LOGWAIT);

function handleMessageEvent(e: MessageEvent) {
  // maybe don't need this?? idk!
  if (window.origin !== e.origin) return;
  const { data } = e;
  const { source, messages } = data;
  if (source === 'console' && Array.isArray(messages)) {
    const decodedMessages = messages.map((message: any) => Decode(message.log));
    decodedMessages.forEach((message: any) => {
      const { data: args } = message;
      const { result, error } = evaluateExpression(args);
      const resultMessages = [
        { log: Encode({ method: error ? 'error' : 'result', data: [result] }) }
      ];
      editor.postMessage(
        {
          messages: resultMessages,
          source: 'sketch'
        },
        editorOrigin
      );
    });
  }
}

window.addEventListener('message', handleMessageEvent);

// catch reference errors, via http://stackoverflow.com/a/12747364/2994108
window.onerror = async function onError(
  msg: string | Event,
  source: string,
  lineNumber: number,
  columnNo: number,
  error: Error | null
) {
  // maybe i can use error.stack sometime but i'm having a hard time triggering
  // this function
  let data: string;
  if (!error) {
    data = typeof msg === 'string' ? msg : String(msg);
  } else {
    data = `${error.name}: ${error.message}`;
    const resolvedFileName = window.objectUrls[source];
    let resolvedLineNo = lineNumber;
    if (window.objectUrls[source] === 'index.html') {
      resolvedLineNo = lineNumber - htmlOffset;
    }
    const line = `\n    at ${resolvedFileName}:${resolvedLineNo}:${columnNo}`;
    data = data.concat(line);
  }
  editor.postMessage(
    {
      source: 'sketch',
      messages: [
        {
          log: [
            {
              method: 'error',
              data: [data],
              id: Date.now().toString()
            }
          ]
        }
      ]
    },
    editorOrigin
  );
  return false;
};
// catch rejected promises
window.onunhandledrejection = async function onUnhandledRejection(
  event: PromiseRejectionEvent
) {
  if (event.reason && event.reason.message) {
    let stackLines: StackFrame[] = [];
    if (event.reason.stack) {
      stackLines = await StackTrace.fromError(event.reason);
    }
    let data = `${event.reason.name}: ${event.reason.message}`;
    stackLines.forEach((stackLine) => {
      const { fileName, functionName, lineNumber, columnNumber } = stackLine;
      const resolvedFileName = window.objectUrls[fileName] || fileName;
      const resolvedFuncName = functionName || '(anonymous function)';
      let line;
      if (lineNumber && columnNumber) {
        let resolvedLineNumber = lineNumber;
        if (resolvedFileName === 'index.html') {
          resolvedLineNumber = lineNumber - htmlOffset;
        }
        line = `\n    at ${resolvedFuncName} (${resolvedFileName}:${resolvedLineNumber}:${columnNumber})`;
      } else {
        line = `\n    at ${resolvedFuncName} (${resolvedFileName})`;
      }
      data = data.concat(line);
    });
    editor.postMessage(
      {
        source: 'sketch',
        messages: [
          {
            log: [
              {
                method: 'error',
                data: [data],
                id: Date.now().toString()
              }
            ]
          }
        ]
      },
      editorOrigin
    );
  }
};

// Monkeypatch p5._friendlyError
const _report = window.p5?._report;

if (_report) {
  window.p5!._report = function resolvedReport(
    message: string,
    method: string,
    color: string
  ) {
    const urls = Object.keys(window.objectUrls);
    const paths = Object.keys(window.objectPaths);
    let newMessage = message;
    urls.forEach((url) => {
      newMessage = newMessage.replaceAll(url, window.objectUrls[url]);
      if (newMessage.match('index.html')) {
        const onLineRegex = /on line (?<lineNo>.\d) in/gm;
        const lineNoRegex = /index\.html:(?<lineNo>.\d):/gm;
        const match = onLineRegex.exec(newMessage);
        if (match?.groups?.lineNo) {
          const line = match.groups.lineNo;
          const resolvedLine = parseInt(line, 10) - htmlOffset;
          newMessage = newMessage.replace(
            onLineRegex,
            `on line ${resolvedLine} in`
          );
          newMessage = newMessage.replace(
            lineNoRegex,
            `index.html:${resolvedLine}:`
          );
        }
      }
    });
    paths.forEach((path) => {
      newMessage = newMessage.replaceAll(path, window.objectPaths[path]);
    });
    _report.apply(window.p5, [newMessage, method, color]);
  };
}
