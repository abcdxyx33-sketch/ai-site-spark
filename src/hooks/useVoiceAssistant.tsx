 import { useState, useCallback, useRef } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 
 // TypeScript declarations for Web Speech API
 interface SpeechRecognitionEvent extends Event {
   resultIndex: number;
   results: SpeechRecognitionResultList;
 }
 
 interface SpeechRecognitionResult {
   isFinal: boolean;
   [index: number]: SpeechRecognitionAlternative;
 }
 
 interface SpeechRecognitionAlternative {
   transcript: string;
   confidence: number;
 }
 
 interface SpeechRecognitionResultList {
   length: number;
   item(index: number): SpeechRecognitionResult;
   [index: number]: SpeechRecognitionResult;
 }
 
 interface SpeechRecognitionInstance extends EventTarget {
   continuous: boolean;
   interimResults: boolean;
   lang: string;
   onstart: (() => void) | null;
   onresult: ((event: SpeechRecognitionEvent) => void) | null;
   onerror: ((event: { error: string }) => void) | null;
   onend: (() => void) | null;
   start(): void;
   stop(): void;
   abort(): void;
 }
 
 declare global {
   interface Window {
     SpeechRecognition: new () => SpeechRecognitionInstance;
     webkitSpeechRecognition: new () => SpeechRecognitionInstance;
   }
 }
 
 interface Message {
   role: "user" | "assistant";
   content: string;
 }
 
 interface UseVoiceAssistantProps {
   onReadyToGenerate: (prompt: string) => void;
 }
 
 export const useVoiceAssistant = ({ onReadyToGenerate }: UseVoiceAssistantProps) => {
   const [isListening, setIsListening] = useState(false);
   const [isProcessing, setIsProcessing] = useState(false);
   const [transcript, setTranscript] = useState("");
   const [messages, setMessages] = useState<Message[]>([]);
   const [assistantResponse, setAssistantResponse] = useState("");
   const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
   const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
 
   const startListening = useCallback(() => {
     if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
       toast.error("Speech recognition not supported in this browser");
       return;
     }
 
     const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
     const recognition = new SpeechRecognitionAPI();
     
     recognition.continuous = true;
     recognition.interimResults = true;
     recognition.lang = "en-US";
 
     recognition.onstart = () => {
       setIsListening(true);
       setTranscript("");
     };
 
     recognition.onresult = (event) => {
       let finalTranscript = "";
       let interimTranscript = "";
 
       for (let i = event.resultIndex; i < event.results.length; i++) {
         const result = event.results[i];
         if (result.isFinal) {
           finalTranscript += result[0].transcript;
         } else {
           interimTranscript += result[0].transcript;
         }
       }
 
       setTranscript(finalTranscript || interimTranscript);
     };
 
     recognition.onerror = (event) => {
       console.error("Speech recognition error:", event.error);
       if (event.error !== "aborted") {
         toast.error("Voice recognition error. Please try again.");
       }
       setIsListening(false);
     };
 
     recognition.onend = () => {
       setIsListening(false);
     };
 
     recognitionRef.current = recognition;
     recognition.start();
   }, []);
 
   const stopListening = useCallback(async () => {
     if (recognitionRef.current) {
       recognitionRef.current.stop();
       recognitionRef.current = null;
     }
     setIsListening(false);
 
     if (transcript.trim()) {
       await sendMessage(transcript.trim());
     }
   }, [transcript]);
 
   const toggleListening = useCallback(() => {
     if (isListening) {
       stopListening();
     } else {
       startListening();
     }
   }, [isListening, startListening, stopListening]);
 
   const speakResponse = useCallback((text: string) => {
     if ("speechSynthesis" in window) {
       window.speechSynthesis.cancel();
       const utterance = new SpeechSynthesisUtterance(text);
       utterance.rate = 1;
       utterance.pitch = 1;
       synthRef.current = utterance;
       window.speechSynthesis.speak(utterance);
     }
   }, []);
 
   const sendMessage = useCallback(async (userMessage: string) => {
     setIsProcessing(true);
     
     const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
     setMessages(newMessages);
     setTranscript("");
 
     try {
       const { data, error } = await supabase.functions.invoke("voice-chat", {
         body: { messages: newMessages },
       });
 
       if (error) throw error;
 
       const { response, readyToGenerate, generationPrompt } = data;
       
       setMessages([...newMessages, { role: "assistant", content: response }]);
       setAssistantResponse(response);
       speakResponse(response);
 
       if (readyToGenerate && generationPrompt) {
         setTimeout(() => {
           onReadyToGenerate(generationPrompt);
         }, 3000);
       }
     } catch (error) {
       console.error("Voice chat error:", error);
       toast.error("Failed to process your message");
     } finally {
       setIsProcessing(false);
     }
   }, [messages, speakResponse, onReadyToGenerate]);
 
   const resetConversation = useCallback(() => {
     setMessages([]);
     setTranscript("");
     setAssistantResponse("");
     if (window.speechSynthesis) {
       window.speechSynthesis.cancel();
     }
   }, []);
 
   return {
     isListening,
     isProcessing,
     transcript,
     messages,
     assistantResponse,
     toggleListening,
     sendMessage,
     resetConversation,
   };
 };