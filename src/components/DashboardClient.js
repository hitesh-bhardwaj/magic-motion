'use client';
import { useState, useEffect } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import Link from 'next/link';

export default function DashboardClient({ components }) {
    const [accessibleComponents, setAccessibleComponents] = useState([]);
    const user = useUser();
    const supabase = useSupabaseClient();

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            const { data: entitlements } = await supabase
                .from('entitlements')
                .select('component_id')
                .eq('user_id', user.id);
            const { data: subscription } = await supabase
                .from('subscriptions')
                .select('status')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .single();
            const accessible = components.filter(
                (c) =>
                    c.status === 'free' ||
                    subscription ||
                    (entitlements && entitlements.some((e) => e.component_id === c.id))
            );
            setAccessibleComponents(accessible);
        };
        fetchData();
    }, [user, components, supabase]);

    if (!user) {
        return (
            <div>
                Please <a href="/login" className="text-blue-500">log in</a> to view your dashboard.
            </div>
        );
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl">Your Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {accessibleComponents.map((component) => (
                    <div key={component.id} className="border p-4">
                        <h2 className="text-xl">{component.title}</h2>
                        <p>{component.description}</p>
                        <Link href={`/components/${component.slug}`} className="text-blue-500">
                            View
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}