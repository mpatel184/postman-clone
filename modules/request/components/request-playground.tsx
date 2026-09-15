"use client";

import { useHotkeys } from "react-hotkeys-hook";
import RequestEditor from "./request-editor";
import TabBar from "./tab-bar";
import { useRequestPlaygroundStore } from "../store/useRequestStore";
import { useState } from "react";
import { toast } from "sonner";


export default function PlaygroundPage() {
    const { tabs, activeTabId, addTab } = useRequestPlaygroundStore();
    const [showCollectionModal, setShowCollectionModal] = useState(false);

    const activeTab = tabs.find((t) => t.id === activeTabId);

    useHotkeys(
        "ctrl+s, meta+s",
        (e) => {
            e.preventDefault();
            if (!activeTab) return;

            toast.success("Request saved to history");
        },
        [activeTab]
    );
    useHotkeys(
        "ctrl+g",
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            addTab();
            toast.success("Request added");
        },
        {
            preventDefault: true,
            enableOnFormTags: true
        }, []
    );

    return (
        <div className="flex flex-col h-full">
            <TabBar />
            <div className="flex-1 overflow-auto">
                <RequestEditor />
            </div>
        </div>
    );
}