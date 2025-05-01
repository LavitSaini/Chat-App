import React, { useEffect, useRef } from "react";
import MessageInput from "../components/MessageInput";
import { formatTime } from "../lib/utils";
import { useChatStore } from "../store/useChatStore";
import MessagesSkeleton from "../components/Skeletons/MessagesSkeleton";
import { useAuthStore } from "../store/useAuthStore";

const AiChatPage = () => {
  const {
    messages,
    getAIMessages,
    isMessagesLoading,
    subscribeToAIMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  
  const messageEndRef = useRef(null);

  useEffect(() => {
    getAIMessages();
    subscribeToAIMessages();

    return () => {
      unsubscribeFromMessages();
    };
  }, [getAIMessages, subscribeToAIMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ✅ Sort messages by creation time
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  if (isMessagesLoading)
    return (
      <div className="h-screen bg-base-200 flex justify-center pt-24">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-4xl flex flex-col">
          <div className="flex-1 flex flex-col overflow-auto">
            <MessagesSkeleton />
          </div>
          <MessageInput showImageSendButton={false} paddingX={"px-6"} />
        </div>
      </div>
    );

  return (
    <div className="h-screen bg-base-200 flex justify-center pt-24">
      <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-4xl flex">
        <div className="flex flex-1 flex-col overflow-auto">
          <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
            {/* Welcome Prompt from AI */}
            <div className="chat chat-start">
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img src="/ai_avatar.png" alt="Ai Icon" />
                </div>
              </div>

              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatTime(Date.now())}
                </time>
              </div>
              <div className="chat-bubble flex flex-col">
                <p>What can I help with?</p>
              </div>
            </div>

            {/* ✅ Sorted AI & User Messages */}
            {sortedMessages.map((message) => (
              <div
                key={message._id}
                className={`chat ${
                  message.senderId === authUser._id ? "chat-end" : "chat-start"
                }`}
                ref={messageEndRef}
              >
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={
                        message.senderId === authUser._id
                          ? authUser.profilePic || "/avatar.png"
                          : "/ai_avatar.png"
                      }
                      alt={
                        message.senderId === authUser._id
                          ? "User Icon"
                          : "AI Icon"
                      }
                    />
                  </div>
                </div>

                <div className="chat-header mb-1">
                  <time className="text-xs opacity-50 ml-1">
                    {formatTime(message.createdAt)}
                  </time>
                </div>
                <div className="chat-bubble flex flex-col">
                  {message.text && <p>{message.text}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <MessageInput showImageSendButton={false} paddingX={"px-6"} />
        </div>
      </div>
    </div>
  );
};

export default AiChatPage;
