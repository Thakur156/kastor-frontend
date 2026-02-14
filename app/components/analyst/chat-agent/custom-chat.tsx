import React, { useEffect, useRef, useState } from "react";
import { Save, Paperclip, Send, MessageSquare, X } from "lucide-react";
import MessageList, {
  containsMarkdownTable,
  parseMarkdownTable,
} from "~/components/analyst/chat-agent/messages-list";
import { ChatMessage, useChatAgent } from "~/hooks/useChatAgent";

interface Props {
  isChatpage: boolean;
}

const CustomChat: React.FC<Props> = ({ isChatpage }) => {
  /* ----------------------------- agent hooks --------------------------- */
  const {
    messages,
    loading,
    input,
    setInput,
    sendMessage,
    sendFeedback,
  } = useChatAgent();

  /* ------------------------------ refs & UI ---------------------------- */
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chartEndRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  /* auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    chartEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  /* -------------------------------------------------------------------- */

  const tableOrChartMsgs = messages.filter(
    (m) => containsMarkdownTable(m.content) || m.type === "chart"
  );
  const regularMsgs = messages.filter(
    (m) => !parseMarkdownTable(m.content) && m.type !== "chart"
  );

  const toggleChatOpen = () => {
    setOpen((prev) => !prev);
  };

  return isChatpage ? (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(95vh-100px)] overflow-hidden px-4">
      {/* LEFT – Insights / Visualisations */}
      <div className="h-1/2 lg:h-full w-full lg:w-[60%] bg-white rounded-2xl border p-6 overflow-y-auto shadow-sm">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Insights &amp; Visualisations
        </h3>

        <MessageList
          messages={tableOrChartMsgs as ChatMessage[]}
          loading={loading}
          messagesEndRef={chartEndRef}
          sendFeedback={sendFeedback}
        />
      </div>

      {/* RIGHT – Chat */}
      <div className="w-full lg:w-[645px] h-1/2 lg:h-full flex flex-col bg-white rounded-2xl shadow-sm border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6">
          <div>
            <h2 className="text-2xl font-bold">Kastor Chat Agent</h2>
            <p className="text-sm text-[#77797E] mt-1">
              Enter any query to get addressed
            </p>
          </div>
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-blue-700 transition"
            onClick={() => {
              /* save chat handler */
            }}
          >
            <Save size={18} />
            Save Chat
          </button>
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Messages */}
        <div className="flex-1 px-6 py-6 overflow-y-auto">
          <MessageList
            messages={regularMsgs}
            loading={loading}
            messagesEndRef={messagesEndRef}
            sendFeedback={sendFeedback}
          />
        </div>

        {/* Input bar */}
        <div className="px-4 py-4 border-t">
          <div className="flex items-center bg-white border rounded-full shadow-sm px-4 py-2 gap-3">
            {/* Logo */}
            <img src="/logo-icon.svg" alt="logo" className="w-5 h-5" />

            {/* Text input */}
            <input
              type="text"
              placeholder="Write a message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) sendMessage();
              }}
              className="flex-1 text-sm focus:outline-none bg-transparent"
            />

            <button type="button" className="text-gray-400 hover:text-gray-600">
              <Paperclip size={18} />
            </button>

            <button
              type="button"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-full"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : !open ? (
    <button
      onClick={toggleChatOpen}
      className="bg-black text-white rounded-full p-4 shadow-lg hover:bg-gray-800 transition"
    >
      <MessageSquare size={24} />
    </button>
  ) : (
    open && (
      <div
        className={`fixed bottom-4 right-4  w-[650px] h-[95%] max-h-[730px] bg-white rounded-xl shadow-xl flex flex-col z-50 border border-gray-200`}
      >
        {/* Header */}
        <div className="bg-black text-white px-3 py-6 flex justify-between items-center">
          <h2 className="font-semibold">Chat Agent</h2>
          <button
            onClick={toggleChatOpen}
            className="text-white hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <MessageList
          messages={messages}
          loading={loading}
          messagesEndRef={messagesEndRef}
          sendFeedback={sendFeedback}
        />

        {/* Input Area */}
        <div className="px-4 py-4 border-t">
          <div className="flex items-center bg-white border rounded-full shadow-sm px-4 py-2 gap-3">
            {/* Logo */}
            <img src="/logo-icon.svg" alt="logo" className="w-5 h-5" />

            {/* Text input */}
            <input
              type="text"
              placeholder="Write a message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) sendMessage();
              }}
              className="flex-1 text-sm focus:outline-none bg-transparent"
            />

            <button type="button" className="text-gray-400 hover:text-gray-600">
              <Paperclip size={18} />
            </button>

            <button
              type="button"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-full"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default CustomChat;
