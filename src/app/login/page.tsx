
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';


export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If the user is already logged in, redirect them away from the login page.
    if (user) {
      router.replace('/home');
    }
  }, [user, router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const redirectUrl = searchParams.get('redirect');

    try {
      const loggedInUser = await login(email, password);
      
      // The isAdmin flag is now set in the AuthContext, so we just check for it.
      // We create a temporary user object from the login response to check the email.
      const tempUser = { email: loggedInUser.email };
      const isAdmin = tempUser.email === 'haxiswoins@qq.com';

      if (isAdmin) {
        toast({
            title: "管理员登录成功",
            description: "欢迎回来，管理员！",
        });
        router.push('/admin/dashboard');
      } else {
        // Redirect to the previous page or profile page for regular users
        toast({
          title: "登录成功",
        });
        router.push(redirectUrl || '/profile');
      }
    } catch (error: any) {
      let description = "邮箱或密码错误，或用户未注册。";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        description = "邮箱或密码错误，请重试。";
      } else if (error.code === 'auth/invalid-email') {
        description = "请输入有效的邮箱地址。";
      }
      toast({
        title: "登录失败",
        description: description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute top-4 left-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-full">
            <ChevronLeft className="h-6 w-6" />
          </Button>
      </div>
      <Card className="w-full max-w-md shadow-2xl">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">欢迎回来</CardTitle>
            <CardDescription>登录以继续您的旅程。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
             <div className="flex w-full gap-2">
                 <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? '登录中...' : <><LogIn className="mr-2" />登录</>}
                </Button>
                <Link href="/register" passHref className="w-full">
                    <Button variant="secondary" className="w-full" size="lg">
                        注册
                    </Button>
                </Link>
             </div>
             <p className="text-xs text-muted-foreground">
              <Link href="/forgot-password" passHref>
                <span className="text-primary hover:underline cursor-pointer">
                  找回密码
                </span>
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
