const metaKey: 'Cmd' | 'Ctrl' = (() => {
  if (typeof navigator !== 'undefined' && navigator.platform != null) {
    return /^MAC/i.test(navigator.platform) ? 'Cmd' : 'Ctrl';
  }

  return 'Ctrl';
})();

const metaKeyName: '⌘' | 'Ctrl' = metaKey === 'Cmd' ? '⌘' : 'Ctrl';

export { metaKey, metaKeyName };