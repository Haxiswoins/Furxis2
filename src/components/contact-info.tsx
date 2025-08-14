'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { SiteContent } from '@/types';
import { Button } from './ui/button';

type ContactInfoProps = {
  content: SiteContent | null;
};

export function ContactInfo({ content }: ContactInfoProps) {
  const infoText = content?.contactInfo 
    ? content.contactInfo 
    : "暂未设置联系方式。管理员请前往后台“网站内容管理”页面进行配置。";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="secondary">联系我们</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>联系方式</AlertDialogTitle>
          <AlertDialogDescription>
            {infoText}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>好的</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
