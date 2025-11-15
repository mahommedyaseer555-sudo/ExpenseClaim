import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Loader2 } from "lucide-react";
import Tesseract from "tesseract.js";
import { toast } from "sonner";

interface OCRUploadProps {
  onDataExtracted: (data: {
    amount?: string;
    date?: string;
    text: string;
  }) => void;
  onFileSelect: (file: File) => void;
}

export const OCRUpload = ({ onDataExtracted, onFileSelect }: OCRUploadProps) => {
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const extractDataFromText = (text: string) => {
    // Extract amount (looks for currency patterns)
    const amountMatch = text.match(/\$?\s*(\d+[.,]\d{2})/);
    const amount = amountMatch ? amountMatch[1].replace(',', '.') : undefined;

    // Extract date (various formats)
    const dateMatch = text.match(/(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})|(\d{4}[-/]\d{1,2}[-/]\d{1,2})/);
    const date = dateMatch ? dateMatch[0] : undefined;

    return { amount, date, text };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Set preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Pass file to parent
    onFileSelect(file);

    // Start OCR processing
    setProcessing(true);
    toast.info("Processing receipt with OCR...");

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            // Optional: show progress
          }
        },
      });

      const extractedData = extractDataFromText(result.data.text);
      onDataExtracted(extractedData);
      
      toast.success("Receipt processed successfully!");
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error("Failed to process receipt. Please enter details manually.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center gap-4">
          {preview ? (
            <div className="relative w-full max-w-md">
              <img
                src={preview}
                alt="Receipt preview"
                className="w-full h-auto rounded-lg border"
              />
              {processing && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Processing receipt...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload a receipt image to automatically extract details
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => document.getElementById('receipt-upload')?.click()}
              disabled={processing}
            >
              <FileText className="h-4 w-4 mr-2" />
              {preview ? "Change Receipt" : "Upload Receipt"}
            </Button>
            <input
              id="receipt-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {processing && (
            <p className="text-sm text-muted-foreground">
              Please wait while we process your receipt...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
