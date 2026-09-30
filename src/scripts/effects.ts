type EffectKind = 'eclipse' | 'scroll-portal' | 'ascii-ripple' | 'depth-image' | 'bend-gallery' | 'glass-reveal' | 'tile-reveal';
type StopEffect = () => void;

/** The small controller loads React and the selected original effect only on demand. */
export function enhanceEffects(): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compact = window.matchMedia('(max-width: 767px)');
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  document.querySelectorAll<HTMLElement>('[data-effect]').forEach(stage => {
    if (stage.dataset.effectBound) return;
    stage.dataset.effectBound = 'true';
    const kind = stage.dataset.effect as EffectKind;
    const mount = stage.querySelector<HTMLElement>('[data-effect-mount]')!;
    const button = stage.querySelector<HTMLButtonElement>('[data-effect-toggle]')!;
    const label = stage.querySelector<HTMLElement>('[data-effect-toggle-label]')!;
    const status = stage.querySelector<HTMLElement>('[data-effect-status]')!;
    const name = stage.getAttribute('aria-label') ?? kind;
    const scrollEffect = stage.dataset.effectScroll === 'true';
    let visible = false;
    let permitted = !reduced.matches && !saveData && !(scrollEffect && compact.matches);
    let stop: StopEffect | undefined;
    let generation = 0;
    let loading = false;
    let failed = false;
    let timer = 0;

    const clear = () => {
      generation++;
      window.clearTimeout(timer);
      stop?.();
      stop = undefined;
      loading = false;
      stage.dataset.effectState = 'static';
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', `Play ${name}`);
      label.textContent = 'Play motion';
    };

    const start = async () => {
      if (!visible || !permitted || document.hidden || stop || loading || failed) return;
      const current = ++generation;
      loading = true;
      stage.dataset.effectState = 'loading';
      try {
        const { mountEffect } = await import('../components/effects/render-effect');
        if (current !== generation) return;
        const cleanup = await mountEffect(mount, kind, {
          ready: () => {
            if (current !== generation) return;
            stage.dataset.effectState = 'playing';
            if (scrollEffect) stage.dataset.runway = 'true';
            button.setAttribute('aria-pressed', 'true');
            button.setAttribute('aria-label', `Pause ${name}`);
            label.textContent = 'Pause motion';
            status.textContent = `${name} is playing.`;
          },
          error: () => {
            if (current !== generation) return;
            failed = true;
            clear();
            status.textContent = 'The still image is available. This browser could not start the effect.';
          },
        });
        if (current !== generation) cleanup();
        else stop = cleanup;
      } catch {
        if (current !== generation) return;
        failed = true;
        clear();
        status.textContent = 'The still image is available. The effect could not be loaded.';
      } finally {
        if (current === generation) loading = false;
      }
    };
    const schedule = () => {
      window.clearTimeout(timer);
      // Let the reading surface paint before parsing the optional 3D engine.
      timer = window.setTimeout(() => { void start(); }, 650);
    };
    button.disabled = false;
    button.addEventListener('click', () => {
      if (stop || loading) {
        permitted = false;
        clear();
        status.textContent = `${name} is paused.`;
      } else {
        permitted = true;
        failed = false;
        visible = true;
        void start();
      }
    });
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
      else clear();
    }, { threshold: 0.03 });
    observer.observe(stage);
    document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); else if (visible) schedule(); });
    reduced.addEventListener('change', () => { permitted = !reduced.matches && !saveData && !(scrollEffect && compact.matches); clear(); if (permitted) schedule(); });
    compact.addEventListener('change', () => { if (scrollEffect && compact.matches) { permitted = false; clear(); delete stage.dataset.runway; } });
    window.addEventListener('pagehide', () => { clear(); observer.disconnect(); });
    window.addEventListener('pageshow', event => { if (event.persisted) observer.observe(stage); });
  });
}
