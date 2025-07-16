import { Loader2 } from "lucide-react"

interface LoadingProps {
    fullScreen?: boolean
    message?: string
}

export default function Loading({ fullScreen = false, message }: LoadingProps) {
    return (
        <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen' : 'min-h-[calc(100vh-8rem)]'} bg-background/80 backdrop-blur-sm`}>
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            {message && <p className="text-muted-foreground text-lg">{message}</p>}
        </div>
    )
} 