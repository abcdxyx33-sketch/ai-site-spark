 import { useState, useRef } from "react";
 import { Upload, Image, FileText, Link2, X, Loader2, Check } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
 import { toast } from "sonner";
 
 interface FileUploadDialogProps {
   onClose: () => void;
   onFileProcessed: (data: { type: string; content: string; usage: "inspiration" | "include" }) => void;
 }
 
 const FileUploadDialog = ({ onClose, onFileProcessed }: FileUploadDialogProps) => {
   const [activeTab, setActiveTab] = useState<"image" | "pdf" | "url">("image");
   const [isProcessing, setIsProcessing] = useState(false);
   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
   const [fileName, setFileName] = useState<string | null>(null);
   const [urlInput, setUrlInput] = useState("");
   const [imageUsage, setImageUsage] = useState<"inspiration" | "include">("inspiration");
   const fileInputRef = useRef<HTMLInputElement>(null);
 
   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
 
     // Validate file type
     if (activeTab === "image") {
       if (!file.type.startsWith("image/")) {
         toast.error("Please select an image file");
         return;
       }
       if (file.size > 10 * 1024 * 1024) {
         toast.error("Image must be less than 10MB");
         return;
       }
     } else if (activeTab === "pdf") {
       if (file.type !== "application/pdf") {
         toast.error("Please select a PDF file");
         return;
       }
       if (file.size > 20 * 1024 * 1024) {
         toast.error("PDF must be less than 20MB");
         return;
       }
     }
 
     setFileName(file.name);
 
     // Create preview for images
     if (activeTab === "image") {
       const reader = new FileReader();
       reader.onload = (event) => {
         setPreviewUrl(event.target?.result as string);
       };
       reader.readAsDataURL(file);
     }
   };
 
   const handleSubmit = async () => {
     setIsProcessing(true);
 
     try {
       if (activeTab === "url") {
         if (!urlInput.trim()) {
           toast.error("Please enter a URL");
           return;
         }
         // Validate URL
         try {
           new URL(urlInput);
         } catch {
           toast.error("Please enter a valid URL");
           return;
         }
 
         onFileProcessed({
           type: "url",
           content: urlInput.trim(),
           usage: "inspiration",
         });
         toast.success("URL added as reference!");
       } else if (activeTab === "image" && previewUrl) {
         onFileProcessed({
           type: "image",
           content: previewUrl,
           usage: imageUsage,
         });
         toast.success(
           imageUsage === "inspiration"
             ? "Image added as design inspiration!"
             : "Image will be included in your website!"
         );
       } else if (activeTab === "pdf" && fileName) {
         // For PDF, we just notify that it's been uploaded
         onFileProcessed({
           type: "pdf",
           content: fileName,
           usage: "inspiration",
         });
         toast.success("PDF added as design reference!");
       }
 
       onClose();
     } catch (error) {
       console.error("Error processing file:", error);
       toast.error("Failed to process file");
     } finally {
       setIsProcessing(false);
     }
   };
 
   const tabs = [
     { id: "image" as const, label: "Image", icon: Image },
     { id: "pdf" as const, label: "PDF", icon: FileText },
     { id: "url" as const, label: "URL", icon: Link2 },
   ];
 
   return (
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
       <div className="w-full max-w-md mx-4 cream-card rounded-2xl p-6 space-y-6 animate-fade-in-up">
         {/* Header */}
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
               <Upload className="w-5 h-5 text-white" />
             </div>
             <div>
               <h3 className="font-semibold text-foreground">Add Reference</h3>
               <p className="text-sm text-muted-foreground">Upload files or add URLs</p>
             </div>
           </div>
           <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
             <X className="w-5 h-5" />
           </Button>
         </div>
 
         {/* Tabs */}
         <div className="flex gap-2 p-1 bg-muted rounded-xl">
           {tabs.map(({ id, label, icon: Icon }) => (
             <button
               key={id}
               onClick={() => {
                 setActiveTab(id);
                 setPreviewUrl(null);
                 setFileName(null);
                 setUrlInput("");
               }}
               className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                 activeTab === id
                   ? "bg-background text-foreground shadow-sm"
                   : "text-muted-foreground hover:text-foreground"
               }`}
             >
               <Icon className="w-4 h-4" />
               {label}
             </button>
           ))}
         </div>
 
         {/* Content */}
         <div className="space-y-4">
           {activeTab === "url" ? (
             <div className="space-y-2">
               <Label htmlFor="url">Website URL</Label>
               <Input
                 id="url"
                 type="url"
                 placeholder="https://example.com"
                 value={urlInput}
                 onChange={(e) => setUrlInput(e.target.value)}
               />
               <p className="text-xs text-muted-foreground">
                 We'll analyze this website for design inspiration
               </p>
             </div>
           ) : (
             <>
               {/* File Upload Area */}
               <div
                 onClick={() => fileInputRef.current?.click()}
                 className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
               >
                 <input
                   ref={fileInputRef}
                   type="file"
                   accept={activeTab === "image" ? "image/*" : "application/pdf"}
                   onChange={handleFileSelect}
                   className="hidden"
                 />
 
                 {previewUrl ? (
                   <img
                     src={previewUrl}
                     alt="Preview"
                     className="max-h-40 mx-auto rounded-lg object-contain"
                   />
                 ) : fileName ? (
                   <div className="flex flex-col items-center gap-2">
                     <FileText className="w-12 h-12 text-muted-foreground" />
                     <p className="text-sm font-medium text-foreground">{fileName}</p>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center gap-2">
                     {activeTab === "image" ? (
                       <Image className="w-12 h-12 text-muted-foreground" />
                     ) : (
                       <FileText className="w-12 h-12 text-muted-foreground" />
                     )}
                     <p className="text-sm text-muted-foreground">
                       Click to upload {activeTab === "image" ? "an image" : "a PDF"}
                     </p>
                     <p className="text-xs text-muted-foreground">
                       Max size: {activeTab === "image" ? "10MB" : "20MB"}
                     </p>
                   </div>
                 )}
               </div>
 
               {/* Image Usage Options */}
               {activeTab === "image" && previewUrl && (
                 <RadioGroup
                   value={imageUsage}
                   onValueChange={(v) => setImageUsage(v as "inspiration" | "include")}
                   className="space-y-2"
                 >
                   <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                     <RadioGroupItem value="inspiration" id="inspiration" />
                     <Label htmlFor="inspiration" className="flex-1 cursor-pointer">
                       <span className="font-medium">Design inspiration</span>
                       <p className="text-xs text-muted-foreground">
                         AI will create a similar style website
                       </p>
                     </Label>
                   </div>
                   <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                     <RadioGroupItem value="include" id="include" />
                     <Label htmlFor="include" className="flex-1 cursor-pointer">
                       <span className="font-medium">Include in website</span>
                       <p className="text-xs text-muted-foreground">
                         This image will be embedded directly
                       </p>
                     </Label>
                   </div>
                 </RadioGroup>
               )}
             </>
           )}
         </div>
 
         {/* Submit Button */}
         <Button
           onClick={handleSubmit}
           disabled={
             isProcessing ||
             (activeTab === "url" && !urlInput.trim()) ||
             (activeTab !== "url" && !previewUrl && !fileName)
           }
           className="w-full gap-2"
         >
           {isProcessing ? (
             <>
               <Loader2 className="w-4 h-4 animate-spin" />
               Processing...
             </>
           ) : (
             <>
               <Check className="w-4 h-4" />
               Add Reference
             </>
           )}
         </Button>
       </div>
     </div>
   );
 };
 
 export default FileUploadDialog;