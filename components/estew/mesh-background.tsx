"use client"

export function MeshBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Blob 1 - brand blue, top-left */}
      <div
        className="absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full"
        style={{
          background: "rgba(0, 102, 255, 0.12)",
          filter: "blur(80px)",
        }}
      />
      {/* Blob 2 - brand indigo, top-right */}
      <div
        className="absolute -right-16 top-24 h-[250px] w-[250px] rounded-full"
        style={{
          background: "rgba(79, 70, 229, 0.1)",
          filter: "blur(60px)",
        }}
      />
      {/* Blob 3 - brand glow, bottom-center */}
      <div
        className="absolute bottom-20 left-1/2 h-[200px] w-[200px] -translate-x-1/2 rounded-full"
        style={{
          background: "rgba(96, 165, 250, 0.08)",
          filter: "blur(70px)",
        }}
      />
    </div>
  )
}
