import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addRequestToCollection, deleteRequest, editRequest, getAllRequestFromCollection, Request, saveRequest, run, runDirect } from "../actions"
import { useRequestPlaygroundStore } from "@/modules/request/store/useRequestStore";

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

export function useRunRequest(requestId: string) {

    const { setResponseViewerData } = useRequestPlaygroundStore();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => await run(requestId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["requests"] });
            //@ts-ignore
            setResponseViewerData(data);
        },
    });
}

export function useRunDirectRequest() {
    const { setResponseViewerData } = useRequestPlaygroundStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (requestData: {
            id: string;
            method: string;
            url: string;
            headers?: Record<string, string>;
            parameters?: Record<string, any>;
            body?: any;
        }) => await runDirect(requestData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["requests"] });
            //@ts-ignore
            setResponseViewerData(data);
        },
    });
}