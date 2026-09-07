import React from 'react'

export default function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-text-primary text-xl">{message}</div>
    </div>
  )
}
