import { FC, ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * Position configuration for a single step/marker on the map
 */
export interface MapPosition {
  /** Unique identifier for this position */
  id: string | number;
  /** X coordinate for pointers (percentage) */
  cxPointers: number;
  /** Y coordinate for pointers (percentage) */
  cyPointers: number;
  /** X coordinate for step marker (percentage) */
  cxStep: number;
  /** Y coordinate for step marker (percentage) */
  cyStep: number;
}

/**
 * Configuration for the MapRenderer component
 */
export interface MapRendererConfig {
  /** Map image/SVG source */
  mapImage: string;
  /** Array of positions for steps/markers */
  positions: MapPosition[];
  /** Optional loading state */
  loading?: boolean;
  /** Optional children to render over the map (animations, etc.) */
  children?: ReactNode;
  /** Optional content to render before map (overlays, screens, etc.) */
  overlayContent?: ReactNode;
  /** Optional loading indicator component */
  loadingIndicator?: ReactNode;
}

/**
 * Props for rendering content at a specific position
 */
export interface PositionRenderProps {
  /** Position configuration */
  position: MapPosition;
  /** Index of this position in the positions array */
  index: number;
}

/**
 * MapRenderer - Pure, configuration-driven map rendering component
 * 
 * This component is completely independent of:
 * - Task count or task order
 * - Quest rules or finish logic
 * - User authentication or data fetching
 * 
 * It only knows how to:
 * - Render a map image
 * - Position elements based on coordinates
 * - Show/hide loading states
 * - Render children and overlays
 */
export interface MapRendererProps extends MapRendererConfig {
  /** Callback to render content at pointer positions */
  renderAtPointers?: (props: PositionRenderProps) => ReactNode;
  /** Callback to render content at step positions */
  renderAtSteps?: (props: PositionRenderProps) => ReactNode;
  /** Optional callback when map visibility changes */
  onVisibilityChange?: (isVisible: boolean) => void;
}

export const MapRenderer: FC<MapRendererProps> = ({
  mapImage,
  positions = [],
  loading = false,
  children,
  overlayContent,
  loadingIndicator,
  renderAtPointers,
  renderAtSteps,
}) => {
  return (
    <div
      style={{
        position: "relative",
      }}
    >
      {/* Overlay content (e.g., finish screens, modals) */}
      {overlayContent}

      {/* Loading overlay */}
      {loading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(255, 255, 255, 0.9)",
            zIndex: 30,
          }}
        >
          {loadingIndicator || (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              Loading...
            </div>
          )}
        </div>
      )}

      {/* Map and decorative elements */}
      <div>
        <img
          src={mapImage}
          style={{
            height: "100%",
            width: "100%",
            filter: loading ? "blur(10px)" : "none",
          }}
          alt="Map"
        />
        {/* Children (e.g., stars, clouds, character animations) */}
        {children}
      </div>

      {/* Positioned elements */}
      {positions.map((position, index) => (
        <motion.div key={position.id}>
          {/* Content at pointer position */}
          {renderAtPointers && renderAtPointers({ position, index })}
          
          {/* Content at step position */}
          {renderAtSteps && renderAtSteps({ position, index })}
        </motion.div>
      ))}
    </div>
  );
};
