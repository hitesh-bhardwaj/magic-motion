'use client';
import { useState, useEffect } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import Header from './Header';
import { MDXRemote } from 'next-mdx-remote';

export default function ComponentPageClient({ component, mdx }) {
    const [hasAccess, setHasAccess] = useState(false);
    const user = useUser();
    const supabase = useSupabaseClient();

    useEffect(() => {
        const checkAccess = async () => {
            if (component.status === 'free') {
                setHasAccess(true);
                return;
            }
            if (!user) {
                setHasAccess(false);
                return;
            }
            const { data: subscription } = await supabase
                .from('subscriptions')
                .select('status')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .single();
            if (subscription) {
                setHasAccess(true);
                return;
            }
            const { data: entitlement } = await supabase
                .from('entitlements')
                .select('id')
                .eq('user_id', user.id)
                .eq('component_id', component.id)
                .single();
            setHasAccess(!!entitlement);
        };
        checkAccess();
    }, [user, component, supabase]);

    if (!hasAccess) {
        return (
            <div>
                <Header />
                <div className="p-4">
                    <p>You do not have access to this component. <a href="/pricing" className="text-blue-500">Purchase or subscribe</a>.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header />
            <div className="p-4">
                <h1 className="text-2xl">{component.title}</h1>
                <MDXRemote {...mdx} />
            </div>
        </div>
    );
}