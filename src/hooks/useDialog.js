import { useEffect, useRef } from "react";
import { useBodyScrollLock } from "./useBodyScrollLock";
const stack = [];
let backgroundLocks = 0, previousInert = false, previousAriaHidden = null;
export function useDialog(open, onClose) {
  const ref = useRef(null), closeRef = useRef(onClose);
  closeRef.current = onClose;
  useBodyScrollLock(open);
  useEffect(() => {
    if (!open || !ref.current) return;
    const previous = document.activeElement, panel = ref.current;
    const background = document.querySelector(".app-root");
    if (background && backgroundLocks++ === 0) {
      previousInert = background.inert;
      previousAriaHidden = background.getAttribute("aria-hidden");
      background.inert = true;
      background.setAttribute("aria-hidden", "true");
    }
    stack.push(panel);
    const getFocusable = () => [...panel.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]')].filter(el => el.getClientRects().length > 0);
    (getFocusable()[0] || panel).focus();
    const keydown = event => {
      if (stack[stack.length - 1] !== panel) return;
      if (event.key === "Escape") { event.preventDefault(); closeRef.current(); }
      if (event.key !== "Tab") return;
      const nodes = getFocusable(), first = nodes[0], last = nodes[nodes.length - 1];
      if (!first) { event.preventDefault(); panel.focus(); }
      else if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      const index = stack.indexOf(panel); if (index >= 0) stack.splice(index, 1);
      if (background && --backgroundLocks === 0) {
        background.inert = previousInert;
        if (previousAriaHidden === null) background.removeAttribute("aria-hidden");
        else background.setAttribute("aria-hidden", previousAriaHidden);
      }
      if (previous?.isConnected && (!stack.length || stack[stack.length - 1].contains(previous))) previous.focus({ preventScroll: true });
    };
  }, [open]);
  return ref;
}
