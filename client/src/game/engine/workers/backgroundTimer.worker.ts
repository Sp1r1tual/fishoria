let interval: ReturnType<typeof setInterval> | null = null;

self.addEventListener('message', (e: MessageEvent) => {
  if (e.data === 'start') {
    if (!interval) {
      let last = performance.now();
      interval = setInterval(() => {
        const now = performance.now();
        const dtFrames = (now - last) / (1000 / 60);
        last = now;
        self.postMessage({ dt: dtFrames });
      }, 100);
    }
  } else if (e.data === 'stop') {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }
});
