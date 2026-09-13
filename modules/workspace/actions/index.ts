"use server"
import db from "@/lib/db"
import { currentUser } from "@/modules/authentication/actions"
import { MEMBER_ROLE } from "@prisma/client"
import { get } from "http"

export const initializeWorkspace = async () => {
    const user = await currentUser()
    if (!user) {
        return { success: false, error: "Unauthorized" }
    }
    try {
        const workspace = await db.workspace.upsert({
            where: {
                name_ownerId: {
                    ownerId: user.id,
                    name: "Personal Workspace"
                }
            },
            update: {
            },
            create: {
                name: "Personal Workspace",
                description: "Default workspace for Use",
                ownerId: user.id,
                members: {
                    create: {
                        userId: user.id,
                        role: MEMBER_ROLE.ADMIN
                    }
                }
            },
            include: {
                members: true,

            }
        })
        return { success: true, workspace }
    }
    catch (error) {
        return { success: false, error: "Failed to create workspace" }
    }
}

export async function getWorkspaces() {
    const user = await currentUser();
    if (!user) {
        throw new Error("Unauthorized")
    }
    try {
        const workspaces = await db.workspace.findMany({
            where: {
                OR: [
                    { ownerId: user.id },
                    { members: { some: { userId: user.id } } }
                ]
            },
            orderBy: { createdAt: "asc" }
        })
        return workspaces
    }
    catch (error) {
        throw new Error("Failed to get workspaces")
    }
}

export async function createWorkspaces(name: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized")
    const workspace = await db.workspace.create({
        data: {
            name,
            ownerId: user.id,
            members: {
                create: {
                    userId: user.id,
                    role: MEMBER_ROLE.ADMIN
                }
            }
        }
    })
    return workspace;
}

export async function getWorkspaceById(id: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const workspace = await db.workspace.findUnique({
        where: {
            id
        },
        include: {
            members: true
        }
    })
    return workspace;
}