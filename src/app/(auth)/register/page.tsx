
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { user, register } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/home');
    }
  }, [user, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "注册失败",
        description: "两次输入的密码不一致。",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "注册失败",
        description: "密码强度不足，请设置至少6位数的密码。",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      toast({
        title: "注册成功！",
        description: "已为您跳转到登录页面。",
      });
      router.push('/login');
    } catch (error: any) {
      let description = "发生未知错误，请重试。";
      if (error.code === 'auth/email-already-in-use') {
        description = "该邮箱已被注册，请尝试登录或使用其他邮箱。";
      } else if (error.code === 'auth/invalid-email') {
        description = "请输入一个有效的邮箱地址。";
      } else if (error.code === 'auth/weak-password') {
          description = "密码强度不足，请设置至少6位数的密码。";
      }
      toast({
        title: "注册失败",
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
        <form onSubmit={handleRegister}>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">创建账户</CardTitle>
            <CardDescription>加入我们，开启您的新旅程。</CardDescription>
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
                placeholder="请输入至少6位数的密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirm-password">确认密码</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                required 
                placeholder="再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? '注册中...' : '注册'}
            </Button>
             <p className="text-xs text-muted-foreground">
              已有账户？{' '}
              <Link href="/login" className="text-primary hover:underline">
                登录
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
