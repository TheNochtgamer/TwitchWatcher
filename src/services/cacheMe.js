const object = Object.create(null);
const debugMode = false;
let defaultTimeout = 10 * 1000;

function set(property, value, time) {
  this[property] = value;
  const savedTimer = this._timers.find(t => t.p === property);
  let defaultValue = false;
  if (typeof time !== 'number') {
    defaultValue = true;
    time = defaultTimeout;
  }

  if (time <= 0) {
    if (savedTimer) this.deleteme('*' + property);
    this._timers.push({
      p: property,
      ms: 0,
      timer: null,
    });
  } else if (savedTimer?.ms <= 0 && defaultValue) {
    return;
  } else if (savedTimer) {
    clearTimeout(savedTimer.timer);
    savedTimer.ms = time;
    savedTimer.timer = setTimeout(() => this.deleteme(property), time);
  } else {
    this._timers.push({
      p: property,
      ms: time,
      timer: setTimeout(() => this.deleteme(property), time),
    });
  }
}
function deleteme(property) {
  if (!property && typeof property !== 'string')
    throw new Error('Nombre de la propiedad invalida');
  if (!property?.startsWith('*')) {
    delete this[property];
  } else {
    property = property.slice(1);
  }
  this._timers
    .filter(t => t.p === property)
    .forEach(t => {
      clearTimeout(t.timer);
      const indx = this._timers.findIndex(tt => tt.p === t.p);
      if (debugMode) console.log('timer clear', t, indx);
      if (indx > -1) this._timers.splice(indx, 1);
    });
}
function setDefaultTimeout(time) {
  if (typeof time !== 'number') return;
  defaultTimeout = time;
}

object._timers = [];
object.set = set.bind(object);
object.deleteme = deleteme.bind(object);
object.setDefaultTimeout = setDefaultTimeout.bind(object);

const cacheMe = new Proxy(object, {
  set: (obj, property, value) => {
    if (debugMode) console.log('set', obj, property, value);
    obj.set(property, value);
    return value;
  },
  get: (obj, property) => {
    if (debugMode) console.log('get', obj, property);
    const savedTimer = obj._timers.find(t => t.p === property);
    if (savedTimer && savedTimer.ms > 0) {
      clearTimeout(savedTimer.timer);
      savedTimer.timer = setTimeout(
        () => obj.deleteme(property),
        savedTimer.ms,
      );
    }

    return obj[property];
  },
});

module.exports = cacheMe;
