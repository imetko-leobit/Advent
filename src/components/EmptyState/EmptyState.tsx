import { FC } from "react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: string;
}

/**
 * Empty State Component
 * Displays a friendly message when no data is available
 */
export const EmptyState: FC<EmptyStateProps> = ({
  title = "No Data Available",
  message = "There is no quest data to display at the moment. Please check back later.",
  icon = "📭",
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        padding: "40px",
        fontFamily: "sans-serif",
        color: "#666",
        maxWidth: "500px",
      }}
    >
      <div style={{ fontSize: "64px", marginBottom: "20px" }}>{icon}</div>
      <h2 style={{ color: "#424242", marginBottom: "10px" }}>{title}</h2>
      <p style={{ fontSize: "16px", lineHeight: "1.5" }}>{message}</p>
    </div>
  );
};
