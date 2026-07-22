import React, { useEffect, useState, useRef } from "react";
import App from "../App";
import "./FloatingWorkspace.css";
import { getSlotY, type PositionSlot } from "../utils/layout";

export default function FloatingWorkspace() {
  const [isOpen, setIsOpen] = useState(false);
  const [yPos, setYPos] = useState(window.innerHeight - 35);
  const dragStart = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  useEffect(() => {
    // Restore saved snapping slot position and open/closed state
    chrome?.storage?.local?.get(["widget_y_slot", "widget_is_open"], (data) => {
      const slot = (data.widget_y_slot as PositionSlot) || "bottom";
      setYPos(getSlotY(slot));
      if (data.widget_is_open !== undefined) {
        setIsOpen(!!data.widget_is_open);
      }
    });

    const handleResize = () => {
      chrome?.storage?.local?.get("widget_y_slot", (data) => {
        const slot = (data.widget_y_slot as PositionSlot) || "bottom";
        setYPos(getSlotY(slot));
      });
    };

    const handleMessage = (request: any) => {
      if (request && request.action === "CLOSE_FLOATING_WORKSPACE") {
        setIsOpen(false);
        chrome?.storage?.local?.set({ widget_is_open: false });
      }
    };

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === "local") {
        if (changes.widget_is_open !== undefined) {
          setIsOpen(!!changes.widget_is_open.newValue);
        }
        if (changes.widget_y_slot !== undefined) {
          const slot = (changes.widget_y_slot.newValue as PositionSlot) || "bottom";
          setYPos(getSlotY(slot));
        }
      }
    };

    chrome?.runtime?.onMessage?.addListener(handleMessage);
    chrome?.storage?.onChanged?.addListener(handleStorageChange);

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chrome?.runtime?.onMessage?.removeListener(handleMessage);
      chrome?.storage?.onChanged?.removeListener(handleStorageChange);
    };
  }, []);

  const handleMouseMove = (e: MouseEvent) => {
    // Constrain Y position within safe boundaries of screen height (10px margin around 50px button)
    const constrainedY = Math.max(35, Math.min(e.clientY, window.innerHeight - 35));
    setYPos(constrainedY);
  };

  const handleMouseUp = (e: MouseEvent) => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    const deltaX = Math.abs(e.clientX - dragStart.current.x);
    const deltaY = Math.abs(e.clientY - dragStart.current.y);
    const deltaTime = Date.now() - dragStart.current.time;

    // Treat as click if dragged less than 5px and mouse released within 250ms
    if (deltaX < 5 && deltaY < 5 && deltaTime < 250) {
      setIsOpen(prev => {
        const next = !prev;
        chrome?.storage?.local?.set({ widget_is_open: next });
        return next;
      });
    }

    // Determine the nearest slot to snap to
    const topSlot = getSlotY("top");
    const midSlot = getSlotY("middle");
    const botSlot = getSlotY("bottom");

    const diffTop = Math.abs(e.clientY - topSlot);
    const diffMid = Math.abs(e.clientY - midSlot);
    const diffBot = Math.abs(e.clientY - botSlot);

    const minDiff = Math.min(diffTop, diffMid, diffBot);
    let selectedSlot: PositionSlot = "bottom";
    let finalY = botSlot;

    if (minDiff === diffTop) {
      selectedSlot = "top";
      finalY = topSlot;
    } else if (minDiff === diffMid) {
      selectedSlot = "middle";
      finalY = midSlot;
    }

    setYPos(finalY);
    chrome.storage.local.set({ widget_y_slot: selectedSlot });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent default dragging/highlighting behavior
    e.preventDefault();
    dragStart.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const getPanelStyles = (): React.CSSProperties => {
    if (yPos > window.innerHeight * 0.65) {
      // FAB is at or near the bottom -> anchor the bottom of the popup near the bottom of the FAB
      const bottomDistance = Math.max(10, window.innerHeight - (yPos + 25));
      return {
        bottom: `${bottomDistance}px`,
        top: 'auto',
        transform: 'none'
      };
    } else if (yPos < window.innerHeight * 0.35) {
      // FAB is at or near the top -> anchor the top of the popup near the top of the FAB
      const topDistance = Math.max(10, yPos - 25);
      return {
        top: `${topDistance}px`,
        bottom: 'auto',
        transform: 'none'
      };
    } else {
      // FAB is in the middle -> vertically center the popup aligned with the FAB
      return {
        top: `${yPos}px`,
        bottom: 'auto',
        transform: 'translateY(-50%)'
      };
    }
  };

  const logoUrl = chrome.runtime.getURL("icons/icon128.png");

  return (
    <>
      {/* Floating Button Container */}
      <div
        style={{
          position: "fixed",
          top: `${yPos - 25}px`, // Centering vertically on the Y coordinate
          right: "20px",
          width: "50px",
          height: "50px",
          zIndex: 99999
        }}
      >
        <button
          onMouseDown={handleMouseDown}
          className={`iplus-btn ${isOpen ? "iplus-btn-open" : "iplus-btn-closed"}`}
          title="Drag up/down to move. Click to open iPlusFlow Workspace."
        >
          {isOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <img src={logoUrl} alt="iPlusFlow" className="iplus-logo-img" />
          )}
        </button>

        {/* Floating Panel next to the button */}
        {isOpen && (
          <div className="iplus-workspace-panel" style={getPanelStyles()}>
            <App />
          </div>
        )}
      </div>
    </>
  );
}
