export {}

declare global {
  const chrome:
    | {
        runtime?: {
          id?: string
          sendMessage?: (
            message: unknown,
            callback?: (response: unknown) => void,
          ) => void
          onMessage?: {
            addListener: (callback: (message: unknown) => void) => void
          }
        }
        notifications?: {
          create: (
            id: string,
            options: {
              type: 'basic'
              iconUrl: string
              title: string
              message: string
              priority?: number
            },
          ) => void
        }
        action?: {
          setBadgeText: (details: { text: string }) => void
          setBadgeBackgroundColor: (details: { color: string }) => void
        }
        sidePanel?: {
          setPanelBehavior: (options: { openPanelOnActionClick: boolean }) => void
        }
        offscreen?: {
          createDocument: (options: {
            url: string
            reasons: string[]
            justification: string
          }) => Promise<void>
          closeDocument: () => Promise<void>
          hasDocument?: () => Promise<boolean>
        }
      }
    | undefined
}
