import { useEffect } from 'react'
import { usePostureStore } from '../stores/postureStore'

function playChime() {
  const context = new AudioContext()
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = 880
  gain.gain.value = 0.08

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()

  window.setTimeout(() => {
    oscillator.stop()
    void context.close()
  }, 250)
}

export function AlertManager() {
  const { showAlert, clearAlert } = usePostureStore()

  useEffect(() => {
    if (!showAlert) return

    playChime()

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('PostureGuard', {
        body: "Sit up straight! You've been slouching for 30 seconds.",
      })
    }

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'POSTURE_ALERT',
        body: "Sit up straight! You've been slouching for 30 seconds.",
      })
    }

    const timeout = window.setTimeout(() => clearAlert(), 2000)
    return () => window.clearTimeout(timeout)
  }, [clearAlert, showAlert])

  if (!showAlert) return null

  return (
    <div className="alert-pulse pointer-events-none fixed inset-0 z-50 bg-danger" />
  )
}
