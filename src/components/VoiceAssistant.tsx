 import { Mic, MicOff, MessageCircle, X, Loader2, Volume2 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
 import { cn } from "@/lib/utils";
 
 interface VoiceAssistantProps {
   onReadyToGenerate: (prompt: string) => void;
   onClose: () => void;
 }
 
 const VoiceAssistant = ({ onReadyToGenerate, onClose }: VoiceAssistantProps) => {
   const {
     isListening,
     isProcessing,
     transcript,
     messages,
     assistantResponse,
     toggleListening,
     resetConversation,
   } = useVoiceAssistant({ onReadyToGenerate });
 
   return (
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
       <div className="w-full max-w-lg mx-4 cream-card rounded-2xl p-6 space-y-6 animate-fade-in-up">
         {/* Header */}
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
               <MessageCircle className="w-5 h-5 text-white" />
             </div>
             <div>
               <h3 className="font-semibold text-foreground">Voice Assistant</h3>
               <p className="text-sm text-muted-foreground">Tell me about your website</p>
             </div>
           </div>
           <Button
             variant="ghost"
             size="icon"
             onClick={() => {
               resetConversation();
               onClose();
             }}
             className="rounded-full"
           >
             <X className="w-5 h-5" />
           </Button>
         </div>
 
         {/* Conversation Display */}
         <div className="min-h-[200px] max-h-[300px] overflow-y-auto space-y-3 p-4 bg-muted/30 rounded-xl">
           {messages.length === 0 ? (
             <p className="text-center text-muted-foreground text-sm">
               Click the microphone and start describing your website idea!
             </p>
           ) : (
             messages.map((msg, i) => (
               <div
                 key={i}
                 className={cn(
                   "max-w-[85%] p-3 rounded-xl text-sm",
                   msg.role === "user"
                     ? "ml-auto bg-primary text-primary-foreground"
                     : "bg-card text-foreground"
                 )}
               >
                 {msg.content}
               </div>
             ))
           )}
           
           {/* Live transcript */}
           {transcript && (
             <div className="ml-auto max-w-[85%] p-3 rounded-xl text-sm bg-primary/50 text-primary-foreground animate-pulse">
               {transcript}...
             </div>
           )}
 
           {/* Processing indicator */}
           {isProcessing && (
             <div className="flex items-center gap-2 text-muted-foreground text-sm">
               <Loader2 className="w-4 h-4 animate-spin" />
               Thinking...
             </div>
           )}
         </div>
 
         {/* Assistant Response with Speaking Indicator */}
         {assistantResponse && (
           <div className="flex items-center gap-2 text-sm text-muted-foreground">
             <Volume2 className="w-4 h-4 animate-pulse text-primary" />
             Speaking...
           </div>
         )}
 
         {/* Voice Control */}
         <div className="flex flex-col items-center gap-4">
           <button
             onClick={toggleListening}
             disabled={isProcessing}
             className={cn(
               "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
               isListening
                 ? "bg-destructive text-white animate-pulse scale-110"
                 : "gradient-bg text-white hover:scale-105",
               isProcessing && "opacity-50 cursor-not-allowed"
             )}
           >
             {isListening ? (
               <MicOff className="w-8 h-8" />
             ) : (
               <Mic className="w-8 h-8" />
             )}
           </button>
           <p className="text-sm text-muted-foreground">
             {isListening ? "Tap to stop listening" : "Tap to start speaking"}
           </p>
         </div>
       </div>
     </div>
   );
 };
 
 export default VoiceAssistant;