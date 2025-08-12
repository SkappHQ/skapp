export const OBOARDING_LOGOCOLORLOADER_DURATION = 4000;

export const signedInUserSkipToContentList = [
  {
    label: "mainContent",
    id: "#content-with-drawer-main-content"
  },
  {
    label: "sideBar",
    id: "#side-bar"
  },
  {
    label: "topBar",
    id: "#top-bar"
  }
];

export const unsignedInUserSkipToContentList = [
  {
    label: "mainContent",
    id: "#content-without-drawer-main-content"
  }
];

export const EVENTS_TO_IDENTIFY_IDLE_USER = [
  "mousedown",
  "mousemove",
  "keypress",
  "scroll",
  "touchstart"
];

export const MODAL_HEADER_ICON_GAP = "3.5rem";
export const DEFAULT_SCROLL_AMOUNT_PX = 100;
