import db from '@/lib/db';
import { currentUser } from '@/modules/authentication/actions';
import { acceptWorkspaceInvite } from '@/modules/invites/actions';
import { redirect } from 'next/navigation';
import React from 'react'

const Invite = async ({ params }: { params: Promise<{ token: string }> }) => {
    const { token } = await params;
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    let success = false;
    try {
        const invite = await acceptWorkspaceInvite(token);
        success = invite.success;
    } catch (error) {
        console.error("Failed to accept workspace invite:", error);
    }

    if (success) {
        redirect('/');
    }

    redirect('/');
}

export default Invite