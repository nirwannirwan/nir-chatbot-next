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

export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
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
      <div className="mx-auto flex flex-col gap-4">
        <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
          Chatbot Integrate with Langchain + Open AI
        </h1>

        <main>
          <MainContainer style={{ width: "600px", minHeight: "500px" }}>
            <ChatContainer>
              <ConversationHeader>
                <Avatar src="/bot-image.png" />
                <ConversationHeader.Content userName="Chatbot AI" />
              </ConversationHeader>

              <MessageList
                typingIndicator={
                  loading ? (
                    <TypingIndicator content="Pinecone is typing" />
                  ) : null
                }
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
                          message.type === "apiMessage" ? "chatbot" : "you"
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
          {error && (
            <div className="border border-red-400 rounded-md p-4">
              <p className="text-red-500">{error}</p>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}
