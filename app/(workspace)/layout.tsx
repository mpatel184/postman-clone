import React from "react";
import Header from "@/modules/layout/components/header";
import { currentUser } from "@/modules/authentication/actions";
import { initializeWorkspace } from "@/modules/workspace/actions";
import TabbedLeftPanel from "@/modules/workspace/components/tabbed-left-panel";

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
    const workspace = await initializeWorkspace()
    const user = await currentUser()
    return (
        <>
            <Header user={user} />
            <main className="max-h-[calc(100vh-4rem)] h-[calc(100vh-4rem)] flex flex-1 overflow-hidden">
                <div className="flex h-full w-full">
                    <div className="w-12 border-zinc-800 bg-zinc-900">
                        <TabbedLeftPanel />
                    </div>
                    <div className="flex-1 bg-zinc-900">
                        {children}
                    </div>
                </div>
            </main>
        </>
    )
};

export default RootLayout;