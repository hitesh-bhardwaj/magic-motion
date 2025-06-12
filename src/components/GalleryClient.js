'use client';
import { useState, useEffect } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import Link from 'next/link';

export default function GalleryClient({ components }) {
    const [access, setAccess] = useState({ entitlements: [], hasSubscription: false });
    const user = useUser();
    const supabase = useSupabaseClient();

    useEffect(() => {
        const fetchAccess = async () => {
            if (user) {
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
                setAccess({
                    entitlements: entitlements ? entitlements.map(e => e.component_id) : [],
                    hasSubscription: !!subscription,
                });
            }
        };
        fetchAccess();
    }, [user, supabase]);

    const hasAccess = (component) => {
        return component.status === 'free' || access.hasSubscription || access.entitlements.includes(component.id);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl">Component Gallery</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {components.map(component => (
                    <div key={component.id} className="border p-4">
                        <h2 className="text-xl">{component.title}</h2>
                        <p>{component.description}</p>
                        {hasAccess(component) ? (
                            <Link href={`/components/${component.slug}`} className="text-blue-500">View</Link>
                        ) : (
                            <span className="text-red-500">Locked</span>
                        )}
                        <span className="ml-2">{component.status === 'free' ? 'Free' : 'Paid'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}