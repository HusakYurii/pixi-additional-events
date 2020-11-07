import { Ticker } from '@pixi/ticker';
import { InteractionManager } from '@pixi/interaction';

/**
 * To store a data for a touchstart event
 */
class StoredData {
    /**
     * @param {string} id 
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} target - current target sprite that was tested and is hit
     */
    constructor(id, target) {
        this.id = id;
        this.time = Date.now();
        this.type = "touch";
        this.target = target;
    }
}

/**
 * All touch events which will be used for this feature will go to the separate pool
 * It will help to modify the InteractionManager as less as possible
 */
class TouchEventsPool {
    constructor() {
        /**
         * all stored touch events will be in this pool
         */
        this.pool = {};
        /**
         * to keep the unique id for each event
         */
        this.counter = 0;
        /**
         * double touch happens if 2 touches take place within timeRange
         */
        this.timeRange = 300;
        /**
         * Each cleanUpInterval the pool is being checked and all expired data will be removed
         */
        this.cleanUpInterval = 1000;

        this.timePast = 0;

        this.update = this.update.bind(this);
    }

    /**
     * @public
     * @param {PointerEvent} originalEvent - The DOM event
     * @return {StoredData}
     */
    add(interactionEvent) {
        const id = this.counter;
        const storedData = new StoredData(id, interactionEvent.target);
        this.pool[id] = storedData;
        this.counter += 1;
        return storedData;
    }

    /**
     * @public
     * @param {string} id 
     */
    get(id) {
        return this.pool[id];
    }

    /**
     * @public
     * @param {string} id 
     */
    delete(id) {
        delete this.pool[id];
    }

    /**
     * @public
     * @param {StoredData} prev 
     * @param {StoredData} curr 
     * @return {boolean}
     */
    isDoubleTouch(prev, curr) {
        const isSecondTouch = Math.abs(curr.id - prev.id) === 1;
        const isSameTarget = (curr.target === prev.target);
        const inTimeRange = (curr.time - prev.time) < this.timeRange;
        return (isSecondTouch && isSameTarget && inTimeRange);
    }

    /**
     * @public
     * @param {number} dt 
     */
    update(dt) {
        this.timePast += dt * (1000 / 60);
        if (this.timePast >= this.cleanUpInterval) {
            this.timePast = 0;
            this.cleanUp();
        }
    }

    /**
     * To clean up all expired data
     * @private
     */
    cleanUp() {
        const now = Date.now();
        for (let id in this.pool) {
            const isExpired = (now - this.pool[id].time) > this.cleanUpInterval;
            if (isExpired) {
                this.delete(id);
            }
        }
    }
}

/**
 * @private
 */
InteractionManager.prototype.touchEventsPool = new TouchEventsPool();

const superAddEvents = InteractionManager.prototype.addEvents;
const superRemoveEvents = InteractionManager.prototype.removeEvents;

/**
 * To add 'touchstart' event which will be used for double touch interaction
 * and add update method to Ticker's system
 * @private  
 * @extends
 */
InteractionManager.prototype.addEvents = function () {
    superAddEvents.call(this);

    this.onTouchStart = this.onTouchStart.bind(this);
    this.processTouchStart = this.processTouchStart.bind(this);

    Ticker.system.add(this.touchEventsPool.update, this.touchEventsPool);

    if (this.supportsTouchEvents && this.interactionDOMElement) {
        this.interactionDOMElement.addEventListener('touchstart', this.onTouchStart, true);
    }
};

/**
 * @private
 * @extends
 */
InteractionManager.prototype.removeEvents = function () {
    Ticker.system.remove(this.touchEventsPool.update, this.touchEventsPool);

    if (this.supportsTouchEvents && this.interactionDOMElement) {
        this.interactionDOMElement.removeEventListener('touchstart', this.onTouchStart, true);
    }
    superRemoveEvents.call(this);
};


/**
 * @private
 * @param {PointerEvent} originalEvent - The DOM event
 */
InteractionManager.prototype.onTouchStart = function (originalEvent) {

    const events = this.normalizeToPointerData(originalEvent);

    if (this.autoPreventDefault && events[0].isNormalized) {
        const cancelable = originalEvent.cancelable || !('cancelable' in originalEvent);

        if (cancelable) {
            originalEvent.preventDefault();
        }
    }

    const eventLen = events.length;

    for (let i = 0; i < eventLen; i++) {
        const event = events[i];

        const interactionData = this.getInteractionDataForPointerId(event);

        const interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

        interactionEvent.data.originalEvent = originalEvent;
        // the reference to the private property _lastObjectRendered is bad! DId not find out why this.lastObjectRendered was undefined
        this.processInteractive(interactionEvent, this.renderer._lastObjectRendered, this.processTouchStart, true);
    }
};

/**
 * Processes the result of the touch down check and dispatches the event if needed
 *
 * @private
 * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
 * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
 * @param {boolean} hit - the result of the hit test on the display object
 */
InteractionManager.prototype.processTouchStart = function (interactionEvent, displayObject, hit) {

    if (hit) {
        // create and store a data for the new Touch event
        const newData = this.touchEventsPool.add(interactionEvent);
        // Take the previous stored data
        const prevData = this.touchEventsPool.get(newData.id - 1);

        if (prevData && this.touchEventsPool.isDoubleTouch(prevData, newData)) {
            this.dispatchEvent(displayObject, 'dbltouch', interactionEvent);
            this.touchEventsPool.delete(prevData.id);
        }
    }
};
