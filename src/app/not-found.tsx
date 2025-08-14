import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <h1 className="text-9xl font-bold text-primary">404</h1>
      <h2 className="mt-4 text-3xl font-semibold text-foreground">页面未找到</h2>
      <p className="mt-2 text-lg text-muted-foreground">
        抱歉，我们找不到您要查找的页面。
      </p>
      <div className="mt-8">
        <Link href="/home">
          <Button size="lg">
            <Home className="mr-2" />
            返回首页
          </Button>
        </Link>
      </div>
    </div>
  );
}
