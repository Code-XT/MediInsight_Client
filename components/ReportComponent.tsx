import React, { ChangeEvent, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import SocialMediaLinks from "./social-links";
// import { toast } from 'sonner'
import { useToast } from "@/components/ui/use-toast";

type Props = {
  onReportConfirmation: (data: string) => void;
};
const ReportComponent = ({ onReportConfirmation }: Props) => {
  const { toast } = useToast();

  const [base64Data, setBase64Data] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState("");
  function handleReportSelection(event: ChangeEvent<HTMLInputElement>): void {
    // Step 1: Check if there are files in the event target
    if (!event.target.files) return;

    // Step 2: Get the first file from the file list
    const file = event.target.files[0];

    // Step 3: Check if a file was indeed selected
    if (file) {
      let isValidImage = false;
      let isValidDoc = false;
      const validImages = ["image/jpeg", "image/png", "image/webp"];
      const validDocs = ["application/pdf"];
      if (validImages.includes(file.type)) {
        isValidImage = true;
      }
      if (validDocs.includes(file.type)) {
        isValidDoc = true;
      }
      if (!(isValidImage || isValidDoc)) {
        toast({
          variant: "destructive",
          description: "Filetype not supproted!",
        });
        return;
      }

      if (isValidImage) {
        compressImage(file, (compressedFile) => {
          const reader = new FileReader();

          reader.onloadend = () => {
            const base64String = reader.result as string;
            setBase64Data(base64String);
            console.log(base64String);
          };

          reader.readAsDataURL(compressedFile);
        });
      }

      if (isValidDoc) {
        const reader = new FileReader();
        // Docs are not compressed. Might add note that upto 1MB supported. Or use server side compression libraries.
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setBase64Data(base64String);
          console.log(base64String);
        };

        reader.readAsDataURL(file);
      }
    }
  }

  function compressImage(file: File, callback: (compressedFile: File) => void) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create a canvas element
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set  canvas dimensions to match the image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image onto the canvas
        ctx!.drawImage(img, 0, 0);

        // Apply basic compression (adjust quality as needed)
        const quality = 0.1; // Adjust quality as needed

        // Convert canvas to data URL
        const dataURL = canvas.toDataURL("image/jpeg", quality);

        // Convert data URL back to Blob
        const byteString = atob(dataURL.split(",")[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const compressedFile = new File([ab], file.name, {
          type: "image/jpeg",
        });

        callback(compressedFile);
      };
      img.src = e.target!.result as string;
    };

    reader.readAsDataURL(file);
  }

  async function extractDetails(): Promise<void> {
    if (!base64Data) {
      toast({
        variant: "destructive",
        description: "Upload a valid report!",
      });
      return;
    }
    setIsLoading(true);

    const response = await fetch("api/extractreportgemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        base64: base64Data,
      }),
    });

    if (response.ok) {
      const reportText = await response.text();
      console.log(reportText);
      setReportData(reportText);
    }

    setIsLoading(false);
  }

  return (
    <div className="grid w-full items-start gap-6 overflow-auto px-6 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg">
      <fieldset className="relative grid gap-6 rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 shadow-sm">
        <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Report Details
        </legend>

        {isLoading && (
          <div className="absolute z-10 h-full w-full bg-black/50 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">Extracting data...</span>
          </div>
        )}

        <Input
          type="file"
          onChange={handleReportSelection}
          className="border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-gray-100 dark:bg-gray-700"
        />

        <Button
          onClick={extractDetails}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition duration-150"
        >
          1. Upload File
        </Button>

        <Label className="font-medium text-gray-700 dark:text-gray-300">
          Report Summary
        </Label>

        <Textarea
          value={reportData}
          onChange={(e) => setReportData(e.target.value)}
          placeholder="Extracted data from the report will appear here. Get better recommendations by providing additional patient history and symptoms..."
          className="min-h-[200px] resize-none border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        />

        <Button
          variant="destructive"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition duration-150"
          onClick={() => onReportConfirmation(reportData)}
        >
          2. Looks Good
        </Button>

        <div className="flex flex-col items-center justify-center gap-4 p-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <Label className="font-medium text-gray-700 dark:text-gray-300">
            Share your thoughts
          </Label>
          <SocialMediaLinks />
        </div>
      </fieldset>
    </div>
  );
};

export default ReportComponent;
