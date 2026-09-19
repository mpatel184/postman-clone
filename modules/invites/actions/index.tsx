"use server"

import db from "@/lib/db"
import { env } from "@/lib/env"
import { currentUser } from "@/modules/authentication/actions"
import { MEMBER_ROLE } from "@prisma/client"
import { randomBytes } from "crypto"

export const generateWorkspaceInvite = async (
    workspaceId: string,
    role: MEMBER_ROLE = MEMBER_ROLE.VIEWER
) => {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // Check if user is workspace owner or an ADMIN member
    const workspace = await db.workspace.findUnique({
        where: { id: workspaceId },
        include: {
            members: {
                where: { userId: user.id },
            },
        },
    });

    if (!workspace) throw new Error("Workspace not found");

    const isOwner = workspace.ownerId === user.id;
    const isAdmin = workspace.members.some((m) => m.role === MEMBER_ROLE.ADMIN);

    if (!isOwner && !isAdmin) {
        throw new Error("Forbidden: Only workspace admins can generate invite links");
    }

    const token = randomBytes(16).toString("hex");
    const invite = await db.workspaceInvite.create({
        data: {
            workspaceId,
            token,
            role,
            createdById: user.id,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        },
    });

    return `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}`;
};

export const acceptWorkspaceInvite = async (token: string) => {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const invite = await db.workspaceInvite.findUnique({
        where: { token },
    });

    if (!invite) throw new Error("Invalid invite");

    if (invite.expiresAt && invite.expiresAt < new Date()) {
        throw new Error("Invite expired");
    }

    // Check if the user is already a member of this workspace
    const existingMember = await db.workspaceMember.findUnique({
        where: {
            userId_workspaceId: {
                userId: user.id,
                workspaceId: invite.workspaceId,
            },
        },
    });

    if (existingMember) {
        await db.workspaceInvite.delete({
            where: { id: invite.id },
        });
        return { success: true, alreadyMember: true };
    }

    await db.workspaceMember.create({
        data: {
            userId: user.id,
            workspaceId: invite.workspaceId,
            role: invite.role,
        },
    });

    await db.workspaceInvite.delete({
        where: { id: invite.id },
    });

    return { success: true };
};

export const getAllWorkspaceMembers = async (workspaceId: string) => {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // Ensure requester is a member or owner of the workspace
    const workspace = await db.workspace.findFirst({
        where: {
            id: workspaceId,
            OR: [
                { ownerId: user.id },
                { members: { some: { userId: user.id } } },
            ],
        },
    });

    if (!workspace) throw new Error("Forbidden: Not a member of this workspace");

    return await db.workspaceMember.findMany({
        where: { workspaceId },
        include: { user: true },
        orderBy: { createdAt: "asc" },
    });
};