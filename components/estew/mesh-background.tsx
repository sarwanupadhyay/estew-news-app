"use client"

export function MeshBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ animation: "meshFloat 8s ease-in-out infinite" }}
    >
      {/* Blob 1 - brand blue, top-left, 300px, blur(80px), 12% opacity */}
      <div
        className="absolute rounded-full"
        style={{
          width: 300, height: 300, top: -80, left: -80,
          background: "rgba(0, 102, 255, 0.12)",
          filter: "blur(80px)",
        }}
      />
      {/* Blob 2 - brand indigo, top-right, 250px, blur(60px), 10% opacity */}
      <div
        className="absolute rounded-full"
        style={{
          width: 250, height: 250, top: 96, right: -64,
          background: "rgba(79, 70, 229, 0.1)",
          filter: "blur(60px)",
        }}
      />
      {/* Blob 3 - brand glow, bottom-center, 200px, blur(70px), 8% opacity */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          width: 200, height: 200, bottom: 80,
          background: "rgba(96, 165, 250, 0.08)",
          filter: "blur(70px)",
        }}
      />
    </div>
  )
}
