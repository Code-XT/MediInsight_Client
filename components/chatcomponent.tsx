import React from "react";
import { Textarea } from "./ui/textarea";
import { useChat } from "ai/react";
import { Button } from "./ui/button";
import { CornerDownLeft, Loader2, TextSearch } from "lucide-react";
import { Badge } from "./ui/badge";
import Messages from "./messages";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import Markdown from "./markdown";

type Props = {
  reportData?: string;
};

const ChatComponent = ({ reportData }: Props) => {
  const { messages, input, handleInputChange, handleSubmit, isLoading, data } =
    useChat({
      api: "api/medichatgemini",
    });
  return (
    <div className="h-full bg-gray-100 dark:bg-gray-800 relative flex flex-col min-h-[50vh] rounded-xl px-6 py-3 gap-6 shadow-lg">
      {/* Status Badge */}
      <Badge
        variant="outline"
        className={`absolute right-4 top-4 text-sm py-1 px-3 rounded-md transition-colors ${
          reportData
            ? "bg-green-600 text-white"
            : "bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
        }`}
      >
        {reportData ? "✓ Report Added" : "No Report Added"}
      </Badge>

      {/* Spacer for layout adjustment */}
      <div className="flex-1" />

      {/* Messages Section */}
      <Messages messages={messages} isLoading={isLoading} />

      {/* Relevant Info Accordion */}
      {data?.length !== undefined && data.length > 0 && (
        <Accordion type="single" className="text-sm mt-4" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger dir="">
              <span className="flex items-center gap-2">
                <TextSearch className="text-blue-600" />
                Relevant Info
              </span>
            </AccordionTrigger>
            <AccordionContent className="whitespace-pre-wrap mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
              <Markdown
                text={(data[data.length - 1] as any).retrievals as string}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Form Section */}
      <form
        className="relative overflow-hidden rounded-lg border bg-white dark:bg-gray-900 dark:border-gray-700 shadow-md mt-4"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit(event, {
            data: {
              reportData: reportData as string,
            },
          });
        }}
      >
        {/* Input Field */}
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Type your query here..."
          className="min-h-12 w-full border-0 p-3 bg-transparent text-gray-800 dark:text-gray-100 resize-none focus:outline-none"
        />

        {/* Submit Button */}
        <div className="flex items-center p-3 pt-0">
          <Button
            disabled={isLoading}
            type="submit"
            size="sm"
            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-150"
          >
            {isLoading ? "Analysing..." : "3. Ask"}
            {isLoading ? (
              <Loader2 className="ml-2 w-4 h-4 animate-spin" />
            ) : (
              <CornerDownLeft className="ml-2 w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
