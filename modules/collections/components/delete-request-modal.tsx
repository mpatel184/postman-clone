"use client";

import Modal from "@/components/ui/model";
import { useDeleteRequest } from "@/modules/request/hooks/request";
import React from "react";
import { toast } from "sonner";

interface DeleteRequestModalProps {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    collectionId: string;
    request: {
        id: string;
        name: string;
    };
}

const DeleteRequestModal = ({
    isModalOpen,
    setIsModalOpen,
    collectionId,
    request,
}: DeleteRequestModalProps) => {
    const { mutateAsync, isPending } = useDeleteRequest(collectionId);

    const handleDelete = async () => {
        try {
            await mutateAsync(request.id);
            toast.success("Request deleted successfully");
            setIsModalOpen(false);
        } catch (err) {
            toast.error("Failed to delete request");
            console.error("Failed to delete request:", err);
        }
    };

    return (
        <Modal
            title="Delete Request"
            description={`Are you sure you want to delete "${request.name}"? This action cannot be undone.`}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleDelete}
            submitText={isPending ? "Deleting..." : "Delete"}
            submitVariant="destructive"
        >
            <p className="text-sm text-zinc-500">
                Once deleted, this request and all its run history will be permanently removed.
            </p>
        </Modal>
    );
};

export default DeleteRequestModal;
