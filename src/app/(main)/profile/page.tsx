'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ListOrdered, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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


export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error: any) {
        toast({
            title: "退出失败",
            description: error.message,
            variant: "destructive",
        });
    }
  };
  
  if (!user) {
    // This can be a loading spinner or null
    // Or redirect to login if you want to protect this route
    return null;
  }

  const avatarUrl = user.email 
    ? `https://source.boringavatars.com/beam/120/${encodeURIComponent(user.email)}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`
    : 'https://placehold.co/100x100.png';


  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/50">
            <AvatarImage src={avatarUrl} alt={user.email || 'User'} />
            <AvatarFallback>{user.email ? user.email.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-headline">{user.email?.split('@')[0] || '用户'}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="mt-4 flex flex-col gap-4">
          <Link href="/orders" passHref>
            <Button className="w-full" size="lg">
              <ListOrdered className="mr-2" />
              我的订单
            </Button>
          </Link>
           <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full" size="lg">
                  <LogOut className="mr-2" />
                  退出登录
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确定要退出吗？</AlertDialogTitle>
                  <AlertDialogDescription>
                    您将需要重新登录才能访问您的账户信息。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>确认退出</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
