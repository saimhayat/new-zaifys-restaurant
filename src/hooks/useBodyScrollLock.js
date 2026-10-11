import { useEffect } from "react";
let locks = 0, restore = null;
/** Keep overlays still on iOS as well as desktop; restore the exact scroll offset. */
export function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return;
    if (locks++ === 0) {
      const root=document.documentElement, body=document.body, x=window.scrollX, y=window.scrollY;
      const previous={ rootOverflow:root.style.overflow, overflow:body.style.overflow, position:body.style.position, top:body.style.top, width:body.style.width, paddingRight:body.style.paddingRight };
      const scrollbar=Math.max(0,window.innerWidth-root.clientWidth);
      const padding=parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      root.style.overflow="hidden";body.style.overflow="hidden";body.style.position="fixed";body.style.top=`-${y}px`;body.style.width="100%";
      if(scrollbar) body.style.paddingRight=`${padding + scrollbar}px`;
      restore = () => {
        root.style.overflow=previous.rootOverflow;
        for(const key of ["overflow","position","top","width","paddingRight"]) body.style[key]=previous[key];
        window.scrollTo({ left:x, top:y, behavior:"instant" });
      };
    }
    return () => { if (--locks === 0) { restore?.(); restore = null; } };
  },[active]);
}
