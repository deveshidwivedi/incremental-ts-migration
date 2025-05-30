import { useEffect, useRef, useState } from 'react';

export const noop = (): void => {};

export const useDidUpdate = (callback: () => void, deps: DependencyList): void => {
  const hasMount = useRef(false);

  useEffect(() => {
    if (hasMount.current) {
      callback();
    } else {
      hasMount.current = true;
    }
  }, deps);
};

// Usage: const ref = useModalBehavior(() => setSomeState(false))
// place this ref on a component
export function useModalBehavior<T extends HTMLElement = HTMLElement>(
  hideOverlay?: () => void
): [boolean, () => void, (r: T | null) => void] {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  const trigger = () => setVisible((v) => !v);
  const hide = () => setVisible(false);

  const setRef = (r: T | null) => {
    ref.current = r;
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;
    if (
      ref.current &&
      !ref.current.contains(target)
    ) {
      hide();
      if (hideOverlay) hideOverlay();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref]);

  return [visible, trigger, setRef];
}

// Usage: useEffectWithComparison((props, prevProps) => { ... }, { prop1, prop2 })
// This hook basically applies useEffect but keeps track of the last value of relevant props
// So you can pass a 2-param function to capture new and old values and do whatever with them.
export function useEffectWithComparison<T extends Record<string, any>>(
  fn: (props: T, prevProps: T) => void,
  props: T
): void {
  const [prevProps, update] = useState<T>({} as T);

  useEffect(() => {
    fn(props, prevProps);
    update(props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, Object.values(props));
}

export function useEventListener(
  event: string,
  callback: EventListenerOrEventListenerObject,
  useCapture = false,
  deps: DependencyList = []
): void {
  useEffect(() => {
    document.addEventListener(event, callback, useCapture);
    return () => document.removeEventListener(event, callback, useCapture);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
