import React, { createContext, useContext, useState, useCallback } from "react";
import { LuxuryIcon } from "../components/LuxuryIcon";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

interface ModalContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (val: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setModalState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleClose = (result: boolean) => {
    if (modalState) {
      modalState.resolve(result);
      setModalState(null);
    }
  };

  return (
    <ModalContext.Provider value={{ confirm }}>
      {children}
      {modalState && modalState.isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            style={{
              background: "#0d0d0d",
              border: "1px solid rgba(197, 160, 89, 0.3)",
              borderRadius: "12px",
              padding: "32px 28px",
              maxWidth: "440px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(197, 160, 89, 0.15)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: modalState.options.isDestructive
                  ? "rgba(239, 68, 68, 0.12)"
                  : "rgba(197, 160, 89, 0.12)",
                border: `1px solid ${
                  modalState.options.isDestructive ? "#ef4444" : "#c5a059"
                }`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              {modalState.options.isDestructive ? (
                <LuxuryIcon name="alert" size={24} color="#ef4444" />
              ) : (
                <LuxuryIcon name="shield" size={24} color="#c5a059" />
              )}
            </div>

            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.4rem",
                color: "#fff",
                marginBottom: "10px",
              }}
            >
              {modalState.options.title}
            </h3>

            <p
              style={{
                color: "#999",
                fontSize: "0.9rem",
                lineHeight: "1.5",
                marginBottom: "28px",
              }}
            >
              {modalState.options.message}
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => handleClose(false)}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "#161616",
                  border: "1px solid #333",
                  color: "#aaa",
                  borderRadius: "6px",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  letterSpacing: "1px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = "#666")}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = "#333")}
              >
                {modalState.options.cancelText || "CANCEL"}
              </button>

              <button
                type="button"
                onClick={() => handleClose(true)}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: modalState.options.isDestructive
                    ? "#ef4444"
                    : "linear-gradient(135deg, #c5a059 0%, #e6c88a 100%)",
                  border: "none",
                  color: modalState.options.isDestructive ? "#fff" : "#000",
                  borderRadius: "6px",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  letterSpacing: "1px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: modalState.options.isDestructive
                    ? "0 4px 15px rgba(239, 68, 68, 0.4)"
                    : "0 4px 15px rgba(197, 160, 89, 0.3)",
                }}
              >
                {modalState.options.confirmText || "CONFIRM"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
