export {}

declare global {
  const chrome:
    | {
        runtime?: {
          id?: string
          sendMessage?: (message: unknown) => void
        }
        notifications?: {
          create: (
            id: string,
            options: { type: 'basic'; iconUrl: string; title: string; message: string },
          ) => void
        }
      }
    | undefined
}
