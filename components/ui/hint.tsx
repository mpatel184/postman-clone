import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export interface HintProps {
    label: string;
    children: React.ReactNode;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    alignOffset?: number;
}

export const Hint = ({
    label,
    children,
    side,
    align,
    sideOffset,
    alignOffset,
}: HintProps) => {
    return (
        <TooltipProvider delay={100}>
            <Tooltip>
                <TooltipTrigger render={children as React.ReactElement} />

                <TooltipContent

                    side={side}
                    align={align}
                    sideOffset={sideOffset}
                    alignOffset={alignOffset}
                >
                    <p className="font-semibold capitalize">{label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
