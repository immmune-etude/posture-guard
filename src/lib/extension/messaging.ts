export function sendExtensionMessage(message: Record<string, unknown>) {
  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    chrome.runtime.sendMessage(message)
  }
}

export async function startBackgroundMonitoring() {
  sendExtensionMessage({ type: 'START_BACKGROUND_MONITORING' })
}

export async function stopBackgroundMonitoring() {
  sendExtensionMessage({ type: 'STOP_BACKGROUND_MONITORING' })
}

export function isExtensionContext(): boolean {
  return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id)
}

export function isBackgroundMode(): boolean {
  return new URLSearchParams(window.location.search).get('mode') === 'background'
}
