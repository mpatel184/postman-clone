import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addRequestToCollection, deleteRequest, editRequest, getAllRequestFromCollection, Request, saveRequest } from "../actions"


export function useAddRequestToCollection(collectionId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (value: Request) => addRequestToCollection(collectionId, value),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["requests", collectionId] });
        },
    });
}


export function useGetAllRequestFromCollection(collectionId: string) {
    const queryClient = useQueryClient();
    return useQuery({
        queryKey: ["requests", collectionId],
        queryFn: async () => getAllRequestFromCollection(collectionId),

    });
}


export function useSaveRequest(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (value: Request) => saveRequest(id, value),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["requests"] });
        },
    });
}

export function useEditRequest(collectionId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, value }: { id: string; value: Pick<Request, 'name' | 'method' | 'url'> }) =>
            editRequest(id, value),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["requests", collectionId] });
        },
    });
}

export function useDeleteRequest(collectionId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => deleteRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["requests", collectionId] });
        },
    });
}