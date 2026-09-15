"use client";

import Modal from "@/components/ui/model";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useEditRequest } from "@/modules/request/hooks/request";
import { REST_METHOD } from "@prisma/client";

interface EditRequestModalProps {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    collectionId: string;
    request: {
        id: string;
        name: string;
        method: REST_METHOD;
        url: string;
    };
}

const EditRequestModal = ({
    isModalOpen,
    setIsModalOpen,
    collectionId,
    request,
}: EditRequestModalProps) => {
    const [name, setName] = useState(request.name);
    const [url, setUrl] = useState(request.url);
    const [method, setMethod] = useState<REST_METHOD>(request.method);

    // Sync state if the selected request changes
    useEffect(() => {
        setName(request.name);
        setUrl(request.url);
        setMethod(request.method);
    }, [request.id]);

    const { mutateAsync, isPending } = useEditRequest(collectionId);

    const requestColorMap: Record<REST_METHOD, string> = {
        [REST_METHOD.GET]: "text-green-500",
        [REST_METHOD.POST]: "text-blue-500",
        [REST_METHOD.PUT]: "text-yellow-500",
        [REST_METHOD.DELETE]: "text-red-500",
        [REST_METHOD.PATCH]: "text-orange-500",
    };

    const handleSubmit = async () => {
        if (!name.trim() || !url.trim()) {
            toast.error("Please fill in all required fields");
            return;
        }
        try {
            await mutateAsync({ id: request.id, value: { name: name.trim(), method, url: url.trim() } });
            toast.success("Request updated successfully");
            setIsModalOpen(false);
        } catch (err) {
            toast.error("Failed to update request");
            console.error("Failed to update request:", err);
        }
    };

    return (
        <Modal
            title="Edit Request"
            description="Update the request name, method, or URL"
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
            submitText={isPending ? "Saving..." : "Save Changes"}
            submitVariant="default"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Request Name</label>
                    <input
                        className="w-full p-2 border rounded"
                        placeholder="Enter request name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">HTTP Method</label>
                    <Select value={method} onValueChange={(v) => setMethod(v as REST_METHOD)}>
                        <SelectTrigger className="w-full">
                            <SelectValue>
                                <span className={`font-medium ${requestColorMap[method]}`}>{method}</span>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(REST_METHOD).map((m) => (
                                <SelectItem key={m} value={m}>
                                    <span className={`font-medium ${requestColorMap[m]}`}>{m}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">URL</label>
                    <input
                        className="w-full p-2 border rounded"
                        placeholder="https://api.example.com/endpoint"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        type="url"
                    />
                </div>
            </div>
        </Modal>
    );
};

export default EditRequestModal;
