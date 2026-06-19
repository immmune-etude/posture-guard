interface HiddenVideoSourceProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
}

/**
 * Video source kept at a stable off-screen size so the browser never stops
 * decoding frames when the UI tab changes or the preview is hidden.
 */
export function HiddenVideoSource({ videoRef }: HiddenVideoSourceProps) {
  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 -z-50 h-[480px] w-[640px] opacity-0"
    />
  )
}
