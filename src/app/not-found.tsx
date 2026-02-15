import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 bg-surface border-border text-center">
        <div className="text-8xl font-display font-black text-primary mb-4">
          404
        </div>
        <h1 className="text-2xl font-display font-black text-foreground mb-2">
          PAGE NOT FOUND
        </h1>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full">
              <Search className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
