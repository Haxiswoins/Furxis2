'use client' // Error components must be Client Components
 
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <h2 className="mt-4 text-3xl font-semibold text-foreground">出错了！</h2>
      <p className="mt-2 text-lg text-muted-foreground">
        抱歉，应用遇到了一些技术问题。
      </p>
      <div className="mt-8">
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          size="lg"
        >
          再试一次
        </Button>
      </div>
    </div>
  )
}
