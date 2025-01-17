import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { getFunctions, httpsCallable } from "firebase/functions";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
interface Message {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const functions = getFunctions();
  const generateResponse = httpsCallable(functions, "generateChatResponse");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await generateResponse({
        messages: [...messages, { role: "user", content: userMessage }],
        toolQuery: userMessage,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", isStreaming: true },
      ]);

      const response = result.data as { message: string };
      const textToStream = response.message;
      let streamedContent = "";

      for (let i = 0; i < textToStream.length; i++) {
        streamedContent += textToStream[i];
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: streamedContent, isStreaming: true },
        ]);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: textToStream },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg"
        size="icon"
      >
        {isOpen ? <X /> : <MessageCircle />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed z-50 bottom-20 right-4 w-96 h-[600px] bg-gray-100 dark:bg-gray-800 rounded-lg shadow-xl flex flex-col"
          >
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold">ToolStack AI</h2>
            </div>

            {!user && (
              <div className="p-4 border-b dark:border-gray-700 flex flex-col items-center justify-center">
                <h2 className="text-lg font-semibold">
                  Please sign in to use the chatbot
                </h2>
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/signin");
                  }}
                  className="mt-4"
                >
                  Sign in
                </Button>
              </div>
            )}

            {user && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-[80%] ${
                        message.role === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <Avatar className="w-8 h-8 rounded-full flex items-center justify-center m-2">
                        {message.role === "user" ? (
                          <AvatarImage src={user?.photoURL || ""} />
                        ) : (
                          <AvatarImage src="/bot-avatar.png" />
                        )}
                        <AvatarFallback>
                          {message.role === "user" ? "👤" : "🤖"}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700"
                        } prose dark:prose-invert max-w-none`}
                      >
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="/bot-avatar.png" />
                        <AvatarFallback>🤖</AvatarFallback>
                      </Avatar>
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {user && (
              <form
                onSubmit={handleSubmit}
                className="p-4 border-t dark:border-gray-700"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about developer tools..."
                    className="flex-1 p-2 rounded-md border dark:border-gray-600 dark:bg-gray-700"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-blue-500 text-white hover:bg-blue-600 rounded-full p-2 w-10 h-10 flex items-center justify-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
