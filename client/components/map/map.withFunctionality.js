import has from 'lodash/has';
import map from 'lodash/map';

export default {
  props: {
    highlightsToRemove: {
      type: Array,
      // required: true
      default: () => []
    }
  },
  data: () => ({
    scaleFactor: null,
    circleScaleFactor: null,

    container: null,
    textEls: null,
    textElsById: null,
    pathEls: null,
    pathElsById: null,
    pointEls: null,
    pointElsById: null,

    isLoading: true
  }),
  created() {
    this.$watch(
      () => this.$store.state.game.currentGame.territories,
      this.onTerritoryStateUpdated,
      { deep: true }
    );

    this.$watch(
      () => this.highlightsToRemove,
      (newValue) => {
        // should do a deep equal to check old value
        // against new value
        if (!newValue || newValue.length < 1) {
          return;
        }

        newValue.map(this.resetHighlight);
        this.$emit('removed-highights');
      },
      { deep: true }
    );
  },
  mounted() {
    this.viewBox = this.getViewBox();
    this.container = this.$el.querySelector('g');
    this.pathEls = [...this.container.querySelectorAll('path')];
    this.pathElsById = this.groupByAttribute(this.pathEls, 'id');
    this.pointEls = [...this.container.querySelectorAll('circle.point')];
    this.pointElsById = this.groupByAttribute(this.pointEls, 'labelFor');
    this.textEls = this.createTextLabels(this.pointEls);
    this.textElsById = this.groupByAttribute(this.textEls, 'labelFor');
    this.isLoading = false;
    if (!this.testMap) {
      return;
    }
    this.bindEvents();
  },
  beforeDestroy() {
    if (this.testMap) {
      this.unbindEvents();
    }
  },
  methods: {
    bindEvents() {
      this.pathEls.map((pathElement) => {
        pathElement.addEventListener('click', this.clicked);
        return pathElement;
      });
    },
    unbindEvents() {
      this.pathEls.map((pathElement) => {
        pathElement.removeEventListener('click', this.clicked);
        return pathElement;
      });
    },
    clicked(event) {
      const el = event.target;
      const id = el.getAttribute('id');
      this.fillPath(id, 'red');
      this.increaseRadius(id);
      this.updateCount(id);
      this.$emit('click', id);
    },
    onTerritoryStateUpdated(territories) {
      if (this.isLoading) {
        return;
      }

      this.updateTerritories(territories);
    },
    updateTerritories(territories) {
      map(territories, (territory, territoryID) => {
        const territoryEl = this.pathElsById[territoryID];
        const territoryCircle = this.pointElsById[territoryID];
        const territoryNumber = this.textElsById[territoryID];

        territoryEl.style.fill = territory.color;

        if (territory.armies) {
          const MAX_TEXT_SIZE = this.scaleFactor + 12;
          const MAX_CIRCLE_STROKE = 5;
          const MAX_CIRCLE_RADIUS = this.scaleFactor + 12;
          territoryNumber.textContent = territory.armies;
          const computedCircleRadius = Math.min(
            this.circleScaleFactor + territory.armies + 10,
            MAX_CIRCLE_RADIUS
          );
          this.setObjectAsAttributes(territoryNumber, {
            'font-size': Math.min(this.scaleFactor + territory.armies, MAX_TEXT_SIZE)
          });
          this.setObjectAsAttributes(territoryCircle, {
            r: computedCircleRadius,
            'stroke-width': Math.min(territory.armies + 1, MAX_CIRCLE_STROKE)
          });
        }
      });
    },
    highlightTerritory(id) {
      if (!id) {
        return;
      }

      const territory = this.pathElsById[id];
      this.setObjectAsAttributes(territory, {
        stroke: '#fff',
        'stroke-width': 4
      });
    },
    resetHighlight(id) {
      if (!id) {
        return;
      }

      const territory = this.pathElsById[id];
      this.setObjectAsAttributes(territory, {
        stroke: '#fff',
        'stroke-width': 1
      });
      territory.style.color = '#fff';
    },
    fillPath(id, color, opacity = 0.5) {
      const pathEl = this.pathElsById[id];
      pathEl.style.fill = color;
      pathEl.style.opacity = opacity;
    },
    increaseRadius(id) {
      const pointEl = this.pointElsById[id];
      this.setObjectAsAttributes(pointEl, {
        r: this.circleScaleFactor + 10,
        'stroke-width': this.circleScaleFactor / 4
      });
    },
    updateCount(id) {
      const textEl = this.textElsById[id];
      textEl.textContent = 2;
    },
    createTextLabels(pointEls) {
      return pointEls.map((point) => {
        const labelFor = point.getAttribute('labelFor');
        const x = point.getAttribute('cx');
        const y = point.getAttribute('cy');
        const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        const yOffset = 10;
        this.setObjectAsAttributes(textElement, {
          x,
          y: (parseFloat(y) + yOffset),
          'y-offset': yOffset,
          labelFor,
          fill: 'white',
          'font-family': '"Trebuchet MS", Helvetica, sans-serif',
          'font-size': `${Math.floor(this.scaleFactor)}px`,
          'text-anchor': 'middle'
        });
        textElement.classList.add(labelFor);
        textElement.textContent = 0;
        return this.container.appendChild(textElement);
      });
    },
    setObjectAsAttributes(el, attributeObj) {
      Object.keys(attributeObj).map(
        attributeKey => el.setAttribute(attributeKey, attributeObj[attributeKey])
      );
    },
    getViewBox() {
      const svgEl = this.$el.querySelector('svg');
      const viewBoxAttribute = svgEl.getAttribute('viewBox');
      const mapSquaredArea = viewBoxAttribute.split(' ')
        .map(n => parseInt(n, 10))
        // eslint-disable-next-line no-return-assign,no-param-reassign
        .reduce((result, current) => result += Math.abs(current), 0);
      this.scaleFactor = Math.floor(mapSquaredArea / 200);
      this.circleScaleFactor = Math.floor(this.scaleFactor * 0.66);
    },
    groupByAttribute(elements, attribute) {
      if (!elements && elements.length) {
        throw new Error('Invalid list of elements');
      }

      return elements.reduce((result, el) => {
        const id = el.getAttribute(attribute);
        if (!has(result, id)) {
          return {
            ...result,
            [id]: el
          };
        }

        return result;
      }, {});
    }
  }
};
