// Used for unbinding events
const listeners = [];
const vendorPrefix = ['webkit', 'moz', 'MS', 'o', ''];
// https://codepen.io/MyXoToD/post/howto-self-drawing-svg-animation

export default {
  data: () => ({
    animationListeners: [],
    animationIndex: 0,
    animationClass: '',
    events: {
      start: 'AnimationStart',
      iteration: 'AnimationIteration',
      end: 'AnimationEnd'
    }
  }),
  mounted() {
    if (!this.animatedMap) {
      return;
    }

    this.fillColor = '#0e2c38';
    this.$el.classList.add('animated-map');
    this.animationClass = 'svg-path-animation--start';
    const itemsToAnimate = Object.keys(this.pathElsById);
    this.animatepathsSequentially(itemsToAnimate);
  },
  methods: {
    animatepathsSequentially(pathsToAnimate) {
      if (this.animationIndex >= pathsToAnimate.length) {
        return;
      }

      const idToAnimate = pathsToAnimate[this.animationIndex];
      const animatedPath = this.pathElsById[idToAnimate];
      const pathLength = animatedPath.getTotalLength();
      animatedPath.classList.add(this.animationClass);
      animatedPath.setAttribute('style', `stroke-dasharray: ${pathLength}; stroke-dashoffset: ${pathLength};`);
      this.animationListener(animatedPath, () => {
        this.transitionFillPaths([idToAnimate]);
        this.animationIndex += 1;
        this.animatepathsSequentially(pathsToAnimate);
      });
    },
    transitionFillPaths(pathsToFill) {
      pathsToFill.map((pathId) => {
        this.pathElsById[pathId].style.fill = this.fillColor;
        return pathId;
      });
    },
    prefixEvent(element, eventType, eventHandler) {
      const lenPrefix = vendorPrefix.length;
      for (let currentPrefix = 0; currentPrefix < lenPrefix; currentPrefix += 1) {
        if (!vendorPrefix[currentPrefix]) {
          // eslint-disable-next-line no-param-reassign
          eventType = eventType.toLowerCase();
        }

        listeners.push({
          element,
          eventType,
          eventHandler
        });

        element.addEventListener(vendorPrefix[currentPrefix] + eventType, eventHandler, false);
      }
    },
    animationListener(element, handler) {
      this.prefixEvent(element, this.events.end, handler);
    },
    removeListeners() {
      const numListeners = this.animationListeners.length;
      let current = 0;
      while (current <= numListeners) {
        const currentEvent = numListeners[current];
        currentEvent.element.removeEventListener(currentEvent.type, currentEvent.callback);
        current += 1;
      }
    }
  }
};
