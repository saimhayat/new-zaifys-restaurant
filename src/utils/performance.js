/** Optional browser hints select a conservative profile; they are not a benchmark. */
export function performanceMode(device = {}) {
  const memory = device.deviceMemory, cores = device.hardwareConcurrency;
  const connection = device.connection ?? device.mozConnection ?? device.webkitConnection;
  const limitedMemory = Number.isFinite(memory) && memory > 0 && memory <= 4;
  const limitedCores = Number.isFinite(cores) && cores > 0 && cores <= 4;
  const limitedNetwork = connection?.saveData === true || ["slow-2g", "2g", "3g"].includes(connection?.effectiveType);
  return limitedMemory || limitedCores || limitedNetwork ? "lite" : "full";
}

export function installPerformanceProfile(win = window) {
  const connection = win.navigator.connection ?? win.navigator.mozConnection ?? win.navigator.webkitConnection;
  const update = () => {
    const next = performanceMode(win.navigator);
    if (win.document.documentElement.dataset.performance === next) return;
    win.document.documentElement.dataset.performance = next;
    win.dispatchEvent(new win.Event("zaify-performance"));
  };
  update();
  connection?.addEventListener?.("change", update);
  return () => connection?.removeEventListener?.("change", update);
}
