'use client';
import { AdminCharacterSeriesForm } from '@/components/admin-character-series-form';

export default function NewCharacterSeriesPage() {
    return (
        <div>
            <h1 className="text-3xl font-headline font-bold mb-6">新增设定系列</h1>
            <AdminCharacterSeriesForm />
        </div>
    );
}
