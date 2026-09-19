"use client";
import Modal from "@/components/ui/model";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRequestPlaygroundStore } from "../store/useRequestStore";
import { Sparkle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSuggestRequestName } from "@/modules/ai/hooks/ai-suggestion";
import { set } from "zod";
import { Input } from "@/components/ui/input";

const AddNameModal = ({
    isModalOpen,
    setIsModalOpen,
    tabId,
}: {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    tabId: string;
}) => {
    const { updateTab, tabs, markUnsaved } = useRequestPlaygroundStore();
    const { mutateAsync, data, isPending, isError } = useSuggestRequestName();
    const tab = tabs.find((t) => t.id === tabId);

    const [name, setName] = useState(tab?.title || "");
    const [suggestions, setSuggestions] = useState<Array<{ name: string; reasoning: string }>>([]);


    useEffect(() => {
        if (tab) setName(tab.title);
    }, [tabId]);

    const handleSubmit = async () => {
        if (!name.trim()) return;
        try {
            updateTab(tabId, { title: name });
            markUnsaved(tabId, true);
            toast.success("Request name updated");
            setIsModalOpen(false);
            setSuggestions([]);
        } catch (err) {
            toast.error("Failed to update request name");
            console.error(err);
        }
    };

    return (
        <Modal
            title="Rename Request"
            description="Give your request a name"
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
            submitText="Save"
            submitVariant="default"
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-row items-center justify-center gap-2">
                    <Input
                        className="w-full p-2 border rounded bg-zinc-900 text-white"
                        placeholder="Request Name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <Button
                        variant={"outline"}
                        size={"icon"}
                        onClick={async () => {
                            if (!tab) return;
                            try {
                                const result = await mutateAsync({
                                    workspaceName: tab.workspaceId || "Default Workspace",
                                    method: (tab.method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE") || "GET",
                                    url: tab.url || "",
                                    description: `Request in collection ${tab.collectionId || ""}`
                                });

                                if (result.suggestions && result.suggestions.length > 0) {
                                    setSuggestions(result.suggestions);
                                    setName(result.suggestions[0].name);
                                    toast.success("Generated name suggestions");
                                }
                            } catch (error) {
                                toast.error("Failed to generate name suggestions");
                            }
                        }}
                        disabled={isPending}
                    >
                        <Sparkles className="h-5 w-5 text-indigo-500" />
                    </Button>
                </div>
                {isPending && (
                    <div className="flex flex-col gap-3 p-3 rounded-lg border border-indigo-500/30 bg-indigo-950/20">
                        {/* Header */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                            </div>
                            <span className="text-xs font-medium text-indigo-300">
                                AI is thinking
                                <span className="inline-flex gap-0.5 ml-1">
                                    <span className="animate-bounce [animation-delay:0ms]">.</span>
                                    <span className="animate-bounce [animation-delay:150ms]">.</span>
                                    <span className="animate-bounce [animation-delay:300ms]">.</span>
                                </span>
                            </span>
                        </div>

                        {/* Shimmer skeleton rows */}
                        {[70, 55, 85].map((w, i) => (
                            <div
                                key={i}
                                className="flex flex-row justify-between items-center p-2.5 rounded-md border border-zinc-700/50 bg-zinc-900/60"
                            >
                                <div
                                    className="h-3 rounded bg-zinc-700 animate-pulse"
                                    style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }}
                                />
                                <div
                                    className="h-2.5 rounded bg-zinc-800 animate-pulse ml-4"
                                    style={{ width: "20%", animationDelay: `${i * 120 + 60}ms` }}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {!isPending && suggestions.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="flex flex-row justify-between items-center p-2 border rounded bg-zinc-900 hover:bg-zinc-800 cursor-pointer"
                                onClick={() => setName(suggestion.name)}
                            >
                                <span className="text-sm text-white">{suggestion.name}</span>
                                <span className="text-xs text-gray-400">{suggestion.reasoning}</span>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </Modal>
    );
};

export default AddNameModal;