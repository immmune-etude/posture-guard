chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
})

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== 'POSTURE_ALERT') return

  chrome.notifications.create(`posture-alert-${Date.now()}`, {
    type: 'basic',
    iconUrl: 'favicon.svg',
    title: 'PostureGuard',
    message: message.body ?? 'Sit up straight!',
  })
})
