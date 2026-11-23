import { Component } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";

// A crash while a page draws shows this message instead of a blank white screen.
// Moving to another page (resetKey changes) tries again.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Page crashed:", error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div role="alert" style={{ maxWidth: 480, margin: "15vh auto", padding: "0 16px", textAlign: "center", fontFamily: "'Work Sans', sans-serif" }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: "#2F4F4F", marginBottom: 8 }}>This page stopped working</h2>
        <p style={{ color: "#555", marginBottom: 24 }}>
          Something went wrong while showing this page. Reloading usually fixes it. Nothing you saved earlier is lost.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ background: "#FFD700", color: "#2F4F4F", fontWeight: 600, border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer" }}
          >
            Reload page
          </button>
          <button
            type="button"
            onClick={() => { window.location.href = "/"; }}
            style={{ background: "transparent", color: "#2F4F4F", border: "1px solid #2F4F4F", borderRadius: 8, padding: "10px 20px", cursor: "pointer" }}
          >
            Go to home
          </button>
        </div>
      </div>
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  resetKey: PropTypes.string,
};

// Inside the router: a new page gets a fresh try
export function RouteErrorBoundary({ children }) {
  const location = useLocation();
  return <ErrorBoundary resetKey={location.pathname}>{children}</ErrorBoundary>;
}

RouteErrorBoundary.propTypes = {
  children: PropTypes.node,
};

export default ErrorBoundary;
