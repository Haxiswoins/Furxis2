'use client';
import { AdminCharacterForm } from '@/components/admin-character-form';

export default function NewCharacterPage() {
    return (
        <div>
            <h1 className="text-3xl font-headline font-bold mb-6">新增领养角色</h1>
            <AdminCharacterForm />
        </div>
    );
}
