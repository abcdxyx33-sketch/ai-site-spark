import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorNotificationProps {
  message: string;
  onDismiss: () => void;
}

const ErrorNotification = ({ message, onDismiss }: ErrorNotificationProps) => {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-destructive text-destructive-foreground px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm font-medium">{message}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className="w-6 h-6 rounded-full hover:bg-white/20 text-destructive-foreground"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ErrorNotification;
