'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, PawPrint, ShoppingCart, LogOut, LayoutDashboard, Settings, Package, Component, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const navItems = [
  { href: '/admin/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { href: '/admin/orders', label: '订单管理', icon: Package },
  { href: '/admin/character-series', label: '设定系列', icon: Layers },
  { href: '/admin/characters', label: '领养角色', icon: PawPrint },
  { href: '/admin/commissions', label: '委托选项', icon: ShoppingCart },
  { href: '/admin/commission-styles', label: '委托样式', icon: Component },
  { href: '/admin/content', label: '网站内容', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
       toast({
        title: '已退出登录',
        description: '您已成功退出管理员账户。',
      });
    } catch (error: any) {
      toast({
        title: '退出失败',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <aside className="h-full w-64 bg-card border-r flex flex-col">
      <div className="p-6">
        <Link href="/">
           <h1 className="text-2xl font-headline cursor-pointer hover:text-primary transition-colors duration-300 font-bold">管理后台</h1>
        </Link>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <Button
              variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/')}>
          <Home className="mr-2 h-4 w-4" />
          返回网站
        </Button>
         <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-500/10">
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确定要退出吗？</AlertDialogTitle>
              <AlertDialogDescription>
                您将需要重新登录才能访问后台管理系统。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>确认退出</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
}
