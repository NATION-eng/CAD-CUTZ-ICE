import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            background: "#050505",
            color: "#fff",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            textAlign: "center",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ maxWidth: "540px", border: "1px solid rgba(197, 160, 89, 0.3)", borderRadius: "12px", padding: "32px", background: "#0c0c0c" }}>
            <h2 style={{ color: "#c5a059", marginBottom: "16px" }}>CAD CUTZ & ICE</h2>
            <p style={{ color: "#aaa", fontSize: "0.9rem", marginBottom: "20px" }}>
              An unexpected display issue occurred. Click the button below to reload the salon console.
            </p>
            {this.state.error && (
              <pre
                style={{
                  background: "#161616",
                  color: "#ef4444",
                  padding: "12px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  textAlign: "left",
                  overflowX: "auto",
                  marginBottom: "20px",
                }}
              >
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              style={{
                background: "linear-gradient(135deg, #c5a059 0%, #e6c88a 100%)",
                color: "#000",
                border: "none",
                padding: "12px 24px",
                borderRadius: "6px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              RELOAD APPLICATION
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
