chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
})

async function hasOffscreenDocument() {
  if (chrome.offscreen?.hasDocument) {
    return chrome.offscreen.hasDocument()
  }
  return false
}

async function startBackgroundMonitoring() {
  if (await hasOffscreenDocument()) return

  await chrome.offscreen.createDocument({
    url: 'index.html?mode=background',
    reasons: ['USER_MEDIA'],
    justification: 'Monitor posture via webcam while the user browses other tabs',
  })
}

async function stopBackgroundMonitoring() {
  if (!(await hasOffscreenDocument())) return
  await chrome.offscreen.closeDocument()
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'START_BACKGROUND_MONITORING') {
    startBackgroundMonitoring()
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: String(error) }))
    return true
  }

  if (message?.type === 'STOP_BACKGROUND_MONITORING') {
    stopBackgroundMonitoring()
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: String(error) }))
    return true
  }

  if (message?.type === 'POSTURE_ALERT') {
    const body =
      message.body ??
      'Sit up straight! Your neck and spine alignment need correction.'

    chrome.notifications.create(`posture-alert-${Date.now()}`, {
      type: 'basic',
      iconUrl: 'favicon.svg',
      title: 'PostureGuard — Correct Your Posture',
      message: body,
      priority: 2,
    })

    chrome.action.setBadgeText({ text: '!' })
    chrome.action.setBadgeBackgroundColor({ color: '#ff4444' })

    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' })
    }, 5000)
  }
})
