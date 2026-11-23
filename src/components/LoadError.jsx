import PropTypes from "prop-types";

// Shown in place of a list or report that could not load, so a failure never looks like "no records"
export default function LoadError({ message, onRetry, title = "Could not load this" }) {
  return (
    <div
      role="alert"
      data-testid="load-error"
      style={{
        border: "1px solid #F5C2C0",
        background: "#FFF5F5",
        borderRadius: 8,
        padding: "24px 16px",
        margin: "16px 0",
        textAlign: "center",
        fontFamily: "'Work Sans', sans-serif",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600, color: "#B42318", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14, color: "#555", marginBottom: onRetry ? 16 : 0 }}>{message}</div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{ background: "#2F4F4F", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 14, cursor: "pointer" }}
        >
          Try again
        </button>
      )}
    </div>
  );
}

LoadError.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
  title: PropTypes.string,
};
