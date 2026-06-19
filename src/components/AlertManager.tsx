import { useEffect } from 'react'
import { sendExtensionMessage } from '../lib/extension/messaging'
import { usePostureStore } from '../stores/postureStore'

function playChime() {
  try {
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
  } catch {
    // Audio may be blocked when tab is hidden
  }
}

export function AlertManager() {
  const { showAlert, clearAlert } = usePostureStore()

  useEffect(() => {
    if (!showAlert) return

    if (!document.hidden) playChime()

    const title = 'PostureGuard — Sit Up Straight'
    const body =
      'Your neck and spine alignment have slipped. Roll shoulders back and align your ears over your shoulders.'

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body })
    }

    sendExtensionMessage({ type: 'POSTURE_ALERT', body })

    const timeout = window.setTimeout(() => clearAlert(), 2000)
    return () => window.clearTimeout(timeout)
  }, [clearAlert, showAlert])

  if (!showAlert || document.hidden) return null

  return (
    <div className="alert-pulse pointer-events-none fixed inset-0 z-50 bg-danger" />
  )
}
