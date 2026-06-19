interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  isActive: boolean
}

export function CameraFeed({ videoRef, isActive }: CameraFeedProps) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-black">
      <video
        ref={videoRef}
        className={`h-full w-full object-cover ${isActive ? 'scale-x-[-1]' : ''}`}
        autoPlay
        playsInline
        muted
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg/80 text-sm text-muted">
          Camera inactive
        </div>
      )}
    </div>
  )
}
