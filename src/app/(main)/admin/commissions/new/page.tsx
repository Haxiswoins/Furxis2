'use client';
import { AdminCommissionForm } from '@/components/admin-commission-form';

export default function NewCommissionPage() {
    return (
        <div>
            <h1 className="text-3xl font-headline font-bold mb-6">新增委托选项</h1>
            <AdminCommissionForm />
        </div>
    );
}
