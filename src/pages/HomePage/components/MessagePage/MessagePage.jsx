import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { socket } from "../../../../socket/socket";
import { conversationService } from "../../../../services/conversation.service";
import { messageService } from "../../../../services/message.service";
import defaultAvatar from "../../../../assets/images/avatar-default.jpg";
import { path } from "../../../../hooks/path";
import { notify } from "../../../../utils/toast";
import usePageTitle from "../../../../hooks/usePageTitle";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const getUserId = (user) => {
  return typeof user === "object" ? user?._id : user;
};

const getUserName = (user) => {
  return user?.full_name || user?.email || "Người dùng";
};

const getUserAvatar = (user) => {
  if (!user) return defaultAvatar;

  if (typeof user.avatar === "string" && user.avatar.trim()) {
    return user.avatar;
  }

  if (typeof user.avatar === "object" && user.avatar?.url) {
    return user.avatar.url;
  }

  if (user.avatar_url) {
    return user.avatar_url;
  }

  return defaultAvatar;
};

const formatTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MessagePage = () => {
  usePageTitle("Tin nhắn");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedConversationId = searchParams.get("conversation");

  const currentUser = useMemo(() => getStoredUser(), []);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  const isCurrentUserHost = (conversation) => {
    return (
      String(getUserId(conversation?.host_id)) === String(currentUser?._id)
    );
  };

  const getOtherUser = (conversation) => {
    if (!conversation || !currentUser?._id) return null;

    return isCurrentUserHost(conversation)
      ? conversation.user_id
      : conversation.host_id;
  };

  const getReceiverId = () => {
    const receiver = getOtherUser(activeConversation);
    return getUserId(receiver);
  };

  const loadConversations = async () => {
    try {
      const res = await conversationService.getMy();
      const list = res.data.metaData || [];

      const onlyHasMessageList = list.filter(
        (item) => item.last_message && item.last_message_at,
      );

      setConversations(onlyHasMessageList);

      if (selectedConversationId) {
        const existed = onlyHasMessageList.find(
          (item) => String(item._id) === String(selectedConversationId),
        );

        if (existed) {
          setActiveConversation(existed);
        } else {
          const selectedRes = await conversationService.getById(
            selectedConversationId,
          );

          setActiveConversation(selectedRes.data.metaData);
        }

        return;
      }

      setActiveConversation(onlyHasMessageList[0] || null);
    } catch (err) {
      console.log(err);
      notify.error("Không thể tải danh sách cuộc trò chuyện.");
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) return;

    try {
      setLoadingMessages(true);
      const res = await messageService.getByConversation(conversationId);
      setMessages(res.data.metaData || []);
    } catch (err) {
      console.log(err);
      notify.error("Không thể tải tin nhắn.");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!currentUser?._id) {
      notify.warning("Vui lòng đăng nhập để xem tin nhắn.");
      navigate("/login");
      return;
    }

    loadConversations();
  }, [selectedConversationId]);

  useEffect(() => {
    if (!activeConversation?._id) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join_conversation", activeConversation._id);

    loadMessages(activeConversation._id);

    const handleReceiveMessage = (message) => {
      if (String(message.conversation_id) !== String(activeConversation._id)) {
        return;
      }

      setMessages((prev) => {
        const existed = prev.some((item) => item._id === message._id);

        if (existed) return prev;

        return [...prev, message];
      });

      setConversations((prev) => {
        const updatedConversation = {
          ...activeConversation,
          last_message: message.content,
          last_message_at: message.createdAt,
        };

        const existed = prev.some(
          (item) => String(item._id) === String(message.conversation_id),
        );

        const nextList = existed
          ? prev.map((item) =>
              String(item._id) === String(message.conversation_id)
                ? updatedConversation
                : item,
            )
          : [updatedConversation, ...prev];

        return nextList.sort(
          (a, b) =>
            new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0),
        );
      });
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.emit("leave_conversation", activeConversation._id);
    };
  }, [activeConversation?._id]);

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    navigate(`/message?conversation=${conversation._id}`);
  };

  const handleSend = () => {
    const receiverId = getReceiverId();

    if (!content.trim()) return;

    if (!activeConversation?._id || !currentUser?._id || !receiverId) {
      notify.warning("Không xác định được người nhận tin nhắn.");
      return;
    }

    socket.emit("send_message", {
      conversationId: activeConversation._id,
      senderId: currentUser._id,
      receiverId,
      content: content.trim(),
    });

    setContent("");
  };
  useEffect(() => {
    const handleConversationUpdated = (payload) => {
      if (
        payload?.conversation_id &&
        String(payload.conversation_id) !== String(activeConversation?._id)
      ) {
        notify.info("Bạn có tin nhắn mới.");
      }
      loadConversations();
    };

    socket.on("conversation_updated", handleConversationUpdated);

    return () => {
      socket.off("conversation_updated", handleConversationUpdated);
    };
  }, [activeConversation?._id]);
  const otherUser = getOtherUser(activeConversation);
  const isHost = isCurrentUserHost(activeConversation);

  return (
    <div className="min-h-screen bg-[#f3f6fb]">
      <div className="container-custom py-8">
        <button
          type="button"
          onClick={() => navigate(path.homePage)}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#dbe7ff] bg-white px-5 py-3 text-sm font-semibold text-[#003b95] shadow-sm transition-all duration-300 hover:-translate-x-1 hover:bg-[#f3f8ff] hover:shadow-md"
        >
          <span className="text-lg leading-none">←</span>
          <span>Quay về</span>
        </button>
        <div className="overflow-hidden rounded-[32px] border border-[#dbe7ff] bg-white shadow-[0_20px_55px_rgba(0,59,149,0.08)]">
          <div className="grid h-[720px] grid-cols-[360px_1fr]">
            <aside className="border-r border-[#e6efff] bg-[#f8fbff]">
              <div className="border-b border-[#e6efff] p-5">
                <h1 className="text-[24px] font-bold text-[#10357b]">
                  Tin nhắn
                </h1>
                <p className="mt-1 text-sm text-[#64748b]">
                  Quản lý trao đổi giữa khách và chủ chỗ nghỉ.
                </p>
              </div>

              <div className="h-[calc(720px-96px)] overflow-y-auto p-3">
                {conversations.length === 0 && (
                  <div className="rounded-2xl bg-white p-4 text-sm text-[#64748b] ring-1 ring-[#e6efff]">
                    Chưa có cuộc trò chuyện nào.
                  </div>
                )}

                {conversations.map((item) => {
                  const person = getOtherUser(item);
                  const active = activeConversation?._id === item._id;

                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => handleSelectConversation(item)}
                      className={`mb-3 flex w-full gap-3 rounded-2xl p-4 text-left transition ${
                        active
                          ? "bg-white shadow-sm ring-1 ring-[#006ce4]"
                          : "bg-white/70 ring-1 ring-[#e6efff] hover:bg-white"
                      }`}
                    >
                      <img
                        src={getUserAvatar(person)}
                        alt=""
                        className="h-12 w-12 rounded-full object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-semibold text-[#10357b]">
                            {getUserName(person)}
                          </span>

                          <span className="shrink-0 text-xs text-[#94a3b8]">
                            {formatTime(item.last_message_at)}
                          </span>
                        </div>

                        <span className="mt-1 block truncate text-xs text-[#006ce4]">
                          {item.property_id?.title}
                        </span>

                        <span className="mt-1 block truncate text-sm text-[#64748b]">
                          {item.last_message}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="flex min-w-0 flex-col">
              <div className="flex items-center gap-3 border-b border-[#e6efff] p-5">
                {activeConversation ? (
                  <>
                    <img
                      src={getUserAvatar(otherUser)}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />

                    <div className="min-w-0">
                      <h2 className="truncate text-[20px] font-bold text-[#10357b]">
                        {getUserName(otherUser)}
                      </h2>

                      <p className="mt-1 truncate text-sm text-[#64748b]">
                        {isHost ? "Khách đang hỏi về" : "Chủ chỗ nghỉ của"}{" "}
                        <span className="font-semibold text-[#006ce4]">
                          {activeConversation.property_id?.title}
                        </span>
                      </p>
                    </div>
                  </>
                ) : (
                  <div>
                    <h2 className="text-[20px] font-bold text-[#10357b]">
                      Chọn cuộc trò chuyện
                    </h2>
                    <p className="mt-1 text-sm text-[#64748b]">
                      Chọn một tin nhắn bên trái để bắt đầu trả lời.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto bg-[#f8fbff] p-5">
                {!activeConversation && (
                  <div className="flex h-full items-center justify-center text-sm text-[#64748b]">
                    Chưa chọn cuộc trò chuyện.
                  </div>
                )}

                {activeConversation && loadingMessages && (
                  <div className="text-sm text-[#64748b]">
                    Đang tải tin nhắn...
                  </div>
                )}

                {activeConversation &&
                  !loadingMessages &&
                  messages.length === 0 && (
                    <div className="flex h-full items-center justify-center text-sm text-[#64748b]">
                      Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện.
                    </div>
                  )}

                {messages.map((message) => {
                  const senderId = getUserId(message.sender_id);
                  const isMine = String(senderId) === String(currentUser?._id);

                  return (
                    <div
                      key={message._id || message.createdAt}
                      className={`mb-4 flex ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                          isMine
                            ? "rounded-tr-sm bg-[#006ce4] text-white"
                            : "rounded-tl-sm bg-white text-[#1f2f46] ring-1 ring-[#e6efff]"
                        }`}
                      >
                        {!isMine && (
                          <div className="mb-1 text-xs font-semibold text-[#006ce4]">
                            {getUserName(message.sender_id)}
                          </div>
                        )}

                        <div>{message.content}</div>

                        <div
                          className={`mt-1 text-right text-[11px] ${
                            isMine ? "text-white/70" : "text-[#94a3b8]"
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-[#e6efff] bg-white p-4">
                {activeConversation ? (
                  <div className="flex gap-3">
                    <input
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSend();
                        }
                      }}
                      placeholder={`Trả lời ${getUserName(otherUser)}...`}
                      className="h-12 flex-1 rounded-2xl border border-[#c9d8ef] bg-[#fbfdff] px-4 outline-none transition focus:border-[#006ce4] focus:bg-white"
                    />

                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!content.trim()}
                      className="h-12 rounded-2xl bg-[#006ce4] px-6 font-semibold text-white transition hover:bg-[#003b95] disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
                    >
                      Trả lời
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-[#64748b]">
                    Vui lòng chọn cuộc trò chuyện để trả lời.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
