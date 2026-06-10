import { useCallback, useRef, useState } from "react";
import { ConfirmContext } from "./confirmContext";

export const ConfirmProvider = ({ children }) => {
  const resolverRef = useRef(null);
  const [options, setOptions] = useState(null);

  const confirm = useCallback((nextOptions = {}) => {
    setOptions({
      title: "Xác nhận thao tác",
      message: "Bạn có chắc muốn tiếp tục không?",
      confirmText: "Xác nhận",
      cancelText: "Hủy",
      tone: "danger",
      ...nextOptions,
    });

    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const close = (result) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[420px] rounded-[24px] border border-[#dbe7ff] bg-white p-6 shadow-[0_28px_80px_rgba(0,0,0,0.24)]">
            <h2 className="text-[22px] font-bold text-[#10357b]">
              {options.title}
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-[#5b6b88]">
              {options.message}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => close(false)}
                className="rounded-xl border border-[#cfdcf1] bg-white px-5 py-3 text-sm font-semibold text-[#26446d] transition hover:bg-[#f7fbff]"
              >
                {options.cancelText}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className={`rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${
                  options.tone === "danger"
                    ? "bg-[#d92d20] hover:bg-[#b42318]"
                    : "bg-[#006ce4] hover:bg-[#003b95]"
                }`}
              >
                {options.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
