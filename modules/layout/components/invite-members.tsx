"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Copy, Link as LinkIcon, ShieldAlert } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hint } from "@/components/ui/hint";
import { useWorkspaceStore } from "../store";
import { toast } from "sonner";
import { useGenerateWorkspaceInvite, useGetWorkspaceMemebers } from "@/modules/invites/hooks/invites";
import { MEMBER_ROLE } from "@prisma/client";
import { UserProps } from "../types";

interface InviteMemberProps {
    currentUser?: UserProps | null;
}

const getRoleBadge = (role: MEMBER_ROLE) => {
    switch (role) {
        case MEMBER_ROLE.ADMIN:
            return (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
                    Admin
                </Badge>
            );
        case MEMBER_ROLE.EDITOR:
            return (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-sky-500/40 text-sky-400 bg-sky-500/10">
                    Editor
                </Badge>
            );
        case MEMBER_ROLE.VIEWER:
        default:
            return (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-zinc-600 text-zinc-400 bg-zinc-800/40">
                    Viewer
                </Badge>
            );
    }
};

const InviteMember = ({ currentUser }: InviteMemberProps) => {
    const [inviteLink, setInviteLink] = useState("");
    const [selectedRole, setSelectedRole] = useState<MEMBER_ROLE>(MEMBER_ROLE.VIEWER);
    const { selectedWorkspace } = useWorkspaceStore();

    const { mutateAsync, isPending } = useGenerateWorkspaceInvite(
        selectedWorkspace?.id || ""
    );

    const { data: workspaceMembers, isLoading } = useGetWorkspaceMemebers(
        selectedWorkspace?.id || ""
    );

    const currentMember = workspaceMembers?.find(
        (m: any) => m.userId === currentUser?.id || m.user?.id === currentUser?.id
    );

    const isAdmin = currentMember?.role === MEMBER_ROLE.ADMIN;

    const generateInviteLink = async () => {
        if (!selectedWorkspace?.id) {
            toast.error("Please select a workspace first");
            return;
        }
        try {
            const response = await mutateAsync(selectedRole);
            setInviteLink(response);
            toast.success(`Invite link generated for ${selectedRole.toLowerCase()} role!`);
        } catch (error: any) {
            toast.error(error?.message || "Failed to generate invite link");
        }
    };

    const copyToClipboard = async () => {
        if (inviteLink) {
            await navigator.clipboard.writeText(inviteLink);
            toast.success("Invite link copied to clipboard");
        }
    };

    return (
        <DropdownMenu>
            <Hint label="Members & Invites">
                <DropdownMenuTrigger
                    render={
                        <Button className="border border-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-400 hover:text-emerald-300">
                            <UserPlus className="size-4 text-emerald-400" />
                        </Button>
                    }
                />
            </Hint>

            <DropdownMenuContent className="w-88 rounded-xl" align="end">
                <div className="p-4">
                    <DropdownMenuGroup>
                        <div className="flex items-center justify-between">
                            <div>
                                <DropdownMenuLabel className="p-0 font-semibold text-sm">
                                    {selectedWorkspace?.name || "Workspace"}
                                </DropdownMenuLabel>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {workspaceMembers?.length || 0} member{workspaceMembers?.length === 1 ? "" : "s"}
                                </p>
                            </div>
                            {currentMember && getRoleBadge(currentMember.role)}
                        </div>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="my-3" />

                    {/* Members Avatars with Tooltips showing Name and Role */}
                    <div className="flex -space-x-2 overflow-hidden mb-3">
                        {isLoading ? (
                            <p className="text-xs text-muted-foreground">Loading members...</p>
                        ) : (
                            workspaceMembers?.map((member: any) => (
                                <Hint
                                    key={member.id}
                                    label={`${member.user.name || "Unknown User"} (${member.role})`}
                                >
                                    <Avatar className="border-2 border-background size-8 mt-1">
                                        <AvatarImage src={member.user.image || ""} />
                                        <AvatarFallback>
                                            {member.user.name?.charAt(0) || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                </Hint>
                            ))
                        )}
                    </div>

                    {/* Admin privilege check */}
                    {!isLoading && !isAdmin ? (
                        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-start gap-2.5">
                            <ShieldAlert className="size-4 text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-zinc-400 leading-relaxed">
                                <span className="font-medium text-zinc-200 block mb-0.5">Admin Privilege Required</span>
                                Only workspace admins can invite new members and configure roles.
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Role Selector */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-300">Invite as Role</label>
                                <Select
                                    value={selectedRole}
                                    onValueChange={(val) => {
                                        setSelectedRole(val as MEMBER_ROLE);
                                        setInviteLink("");
                                    }}
                                >
                                    <SelectTrigger className="h-8 text-xs bg-zinc-900 border-zinc-700">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={MEMBER_ROLE.VIEWER}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Viewer</span>
                                                <span className="text-[11px] text-muted-foreground">- Read only</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value={MEMBER_ROLE.EDITOR}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Editor</span>
                                                <span className="text-[11px] text-muted-foreground">- Edit & execute</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value={MEMBER_ROLE.ADMIN}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Admin</span>
                                                <span className="text-[11px] text-muted-foreground">- Full access & invites</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Invite Link Input */}
                            <div className="flex gap-2 items-center">
                                <Input
                                    value={inviteLink}
                                    placeholder="Generate an invite link..."
                                    readOnly
                                    className="h-8 text-xs bg-zinc-900 border-zinc-700"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                    onClick={copyToClipboard}
                                    disabled={!inviteLink}
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            {/* Generate Button */}
                            <Button
                                className="w-full h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                                onClick={generateInviteLink}
                                disabled={isPending || isLoading}
                            >
                                <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
                                {isPending ? "Generating..." : `Generate ${selectedRole.toLowerCase()} Link`}
                            </Button>
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default InviteMember;