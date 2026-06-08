import { useState } from "react";
import { aiService } from "../../../../services/ai.service";
import { LuBotMessageSquare } from "react-icons/lu";
const AiStayAssistant = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    if (!message.trim()) {
      alert("Bạn hãy nhập nhu cầu tìm chỗ nghỉ.");
      return;
    }

    try {
      setLoading(true);
      const res = await aiService.suggestStay(message);
      setAnswer(res.data.metaData || "");
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "AI đang gặp lỗi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="group fixed bottom-4 right-4 z-50 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#006ce4] shadow-[0_10px_28px_rgba(0,108,228,0.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#003b95] hover:shadow-[0_14px_34px_rgba(0,59,149,0.38)] active:scale-95 sm:bottom-6 sm:right-6 sm:h-[58px] sm:w-[58px]"
      >
        <LuBotMessageSquare
          size={28}
          strokeWidth={2.4}
          className="text-white transition-transform duration-300 group-hover:scale-110"
        />

        <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-[#00d084] ring-[3px] ring-white" />
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-[calc(100vw-32px)] max-w-[380px] overflow-hidden rounded-[22px] border border-[#dbe7ff] bg-white shadow-[0_22px_60px_rgba(0,0,0,0.18)] sm:bottom-24 sm:right-6 sm:rounded-[24px]">
          <div className="bg-[#003b95] px-5 py-4 text-white">
            <h3 className="text-[18px] font-bold">Trợ lý tìm chỗ nghỉ</h3>
            <p className="mt-1 text-sm text-white/80">
              Nhập nhu cầu, AI sẽ gợi ý khách sạn phù hợp.
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Ví dụ: Tôi muốn đi Đà Lạt 2 người, ở 2 đêm, giá dưới 1 triệu/đêm..."
              className="h-[120px] w-full rounded-2xl border border-[#dbe7ff] px-4 py-3 text-sm outline-none focus:border-[#006ce4] sm:h-[140px]"
            />

            <button
              type="button"
              onClick={handleAskAI}
              disabled={loading}
              className="mt-3 h-11 w-full rounded-xl bg-[#006ce4] font-semibold text-white hover:bg-[#003b95] disabled:opacity-60"
            >
              {loading ? "AI đang tư vấn..." : "Nhờ AI gợi ý"}
            </button>

            {answer && (
              <div className="mt-4 max-h-[260px] overflow-y-auto rounded-2xl bg-[#f7fbff] p-4 text-sm leading-6 text-[#1f2f46] whitespace-pre-line">
                {answer}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AiStayAssistant;
