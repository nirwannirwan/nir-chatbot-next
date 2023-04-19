import React, { useRef, useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Message } from "@/types/chat";
import ReactMarkdown from "react-markdown";
import { Document } from "langchain/document";

import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message as MessageUI,
  MessageInput,
  ConversationHeader,
  TypingIndicator,
  Avatar
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { Transition } from "@headlessui/react";

export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [openChat, setOpenChat] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: "Hi, I'm a chatbot. Ask me anything!",
        type: "apiMessage"
      }
    ],
    history: []
  });

  const { messages, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  //handle form submission
  async function handleSubmit(e: any) {
    // e.preventDefault();

    setError(null);

    if (!query) {
      alert("Please input a question");
      return;
    }

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: "userMessage",
          message: question
        }
      ]
    }));

    setLoading(true);
    setQuery("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question,
          history
        })
      });
      const data = await response.json();
      console.log("data", data);

      if (data.error) {
        setError(data.error);
      } else {
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: "apiMessage",
              message: data.text,
              sourceDocs: data.sourceDocuments
            }
          ],
          history: [...state.history, [question, data.text]]
        }));
      }
      console.log("messageState", messageState);

      setLoading(false);

      //scroll to bottom
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    } catch (error) {
      setLoading(false);
      setError("An error occurred while fetching the data. Please try again.");
      console.log("error", error);
    }
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === "Enter" && query) {
      handleSubmit(e);
    } else if (e.key == "Enter") {
      e.preventDefault();
    }
  };
  return (
    <Layout>
      <main>
        <button
          className="bg-slate-700 text-slate-200 p-3 rounded-md absolute bottom-5 right-5"
          onClick={() => setOpenChat((prev) => !prev)}
        >
          Open Chat
        </button>
        <Transition show={openChat}>
          <div className="absolute bottom-20 right-5">
            <MainContainer style={{ width: "400px", maxHeight: "500px" }}>
              <ChatContainer>
                <ConversationHeader>
                  <Avatar src="/bot-image.png" />
                  <ConversationHeader.Content userName="Chatbot AI" />
                </ConversationHeader>

                <MessageList
                  typingIndicator={
                    loading ? (
                      <TypingIndicator content="Chatbot is typing" />
                    ) : null
                  }
                  style={{ height: "300px", overflowY: "auto" }}
                >
                  {messages.map((message, index) => {
                    return (
                      <MessageUI
                        key={index}
                        style={{ width: "90%" }}
                        model={{
                          type: "custom",
                          sender: message.type,
                          position: "single",
                          direction:
                            message.type === "apiMessage"
                              ? "incoming"
                              : "outgoing"
                        }}
                      >
                        <MessageUI.CustomContent>
                          <ReactMarkdown>{message.message}</ReactMarkdown>
                        </MessageUI.CustomContent>
                        <MessageUI.Footer
                          sender={
                            message.type === "apiMessage" ? "Chatbot" : "You"
                          }
                        />
                      </MessageUI>
                    );
                  })}
                </MessageList>
                <MessageInput
                  placeholder="Type message here"
                  onSend={handleSubmit}
                  onChange={(e, text) => {
                    setQuery(text);
                  }}
                  sendButton={true}
                  autoFocus
                  disabled={loading}
                  attachButton={false}
                />
              </ChatContainer>
            </MainContainer>
          </div>
        </Transition>
        {error && (
          <div className="border border-red-400 rounded-md p-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}
      </main>
    </Layout>
  );
}
