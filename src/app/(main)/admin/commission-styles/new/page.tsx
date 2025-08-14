'use client';
import { AdminCommissionStyleForm } from '@/components/admin-commission-style-form';

export default function NewCommissionStylePage() {
    return (
        <div>
            <h1 className="text-3xl font-headline font-bold mb-6">新增委托样式</h1>
            <AdminCommissionStyleForm />
        </div>
    );
}
