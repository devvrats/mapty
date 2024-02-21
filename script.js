'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
// navigator.geolocation.getCurrentPosition();
// console.log();
// let mapEvent, map;

// if (navigator.geolocation)
//   navigator.geolocation.getCurrentPosition(
//     pos => {
//       const { latitude, longitude } = pos.coords;
//       const currentPos = `https://www.google.com/maps/@${latitude},${longitude},10.26z`;
//       const coords = [latitude, longitude];
//       map = L.map('map', { closePopupOnClick: false }).setView(coords, 13);

//       L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
//         attribution:
//           '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//       }).addTo(map);

//       // L.marker(coords)
//       //   .addTo(map)
//       //   .bindPopup('A pretty CSS3 popup.<br> Easily customizable.', {
//       //     autoClose: false,
//       //   })
//       //   .openPopup();
//       map.on('click', function (event) {
//         form.classList.remove('hidden');
//         inputDistance.focus();
//         mapEvent = event;
//         // console.log(event);
//         // const {
//         //   latlng: { lat, lng },
//         // } = event;
//         // console.log(lat, lng);

//         // L.marker([lat, lng])
//         //   .addTo(map)
//         //   .bindPopup(
//         //     L.popup({
//         //       maxWidth: 250,
//         //       minWidth: 100,
//         //       autoClose: false,
//         //       // closeOnClick: false,
//         //       className: 'running-popup',
//         //     })
//         //   )
//         //   .openPopup()
//         //   .setPopupContent('Workout');
//       });
//     },
//     () => {
//       alert('location permission is required');
//     }
//   );

class App {
  #map;
  #mapEvent;
  #workout = [];
  constructor() {
    this._getPosition();

    inputType.addEventListener('change', this._toggleElevationField);
    form.addEventListener('submit', this._newWorkout.bind(this));

    containerWorkouts.addEventListener(
      'click',
      function (e) {
        const element = e.target.closest('.workout');
        if (!element) return;

        const workout = this.#workout.find(
          find => find.id === element.dataset.id
        );

        this.#map.setView(workout.coords, 13, {
          animate: true,
          pan: { duration: 1 },
        });
        workout.clicks();

        // console.log(worko.coords);
        // e.target.closest('.workout');

        // L.marker(coords)
        //     .addTo(map)
        //     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.', {
        //       autoClose: false,
        //     })
        //     .openPopup();
      }.bind(this)
    );
  }
  _getPosition() {
    navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => {
      alert('location permission is required');
    });
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    // const currentPos = `https://www.google.com/maps/@${latitude},${longitude},10.26z`;
    const coords = [latitude, longitude];

    this.#map = L.map('map', { closePopupOnClick: false }).setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // L.marker(coords)
    //   .addTo(map)
    //   .bindPopup('A pretty CSS3 popup.<br> Easily customizable.', {
    //     autoClose: false,
    //   })
    //   .openPopup();

    this.#map.on('click', this._showForm.bind(this));
    this._getLocalStorage();
  }

  _showForm(event) {
    this.#mapEvent = event;
    form.classList.remove('hidden');
    inputDistance.focus();

    // console.log(event);
    // const {
    //   latlng: { lat, lng },
    // } = event;
    // console.log(lat, lng);

    // L.marker([lat, lng])
    //   .addTo(map)
    //   .bindPopup(
    //     L.popup({
    //       maxWidth: 250,
    //       minWidth: 100,
    //       autoClose: false,
    //       // closeOnClick: false,
    //       className: 'running-popup',
    //     })
    //   )
    //   .openPopup()
    //   .setPopupContent('Workout');
  }
  _hideForm() {
    // prettier-ignore
    inputDistance.value =inputDuration.value =inputCadence.value =inputElevation.value ='';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => {
      form.style.display = 'grid';
    }, 1000);
  }
  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkout(event) {
    event.preventDefault();
    // inputDistance.value =
    //   inputDuration.value =
    //   inputCadence.value =
    //   inputElevation.value =
    //     '';

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    const {
      latlng: { lat, lng },
    } = this.#mapEvent;
    let workout;

    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    if (type === 'running') {
      const cadence = +inputCadence.value;

      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert(`Please inpute the positive number`);
      }

      workout = new Running(type, distance, duration, [lat, lng], cadence);
    }
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        return alert(`Please inpute the positive number`);
      }
      workout = new Cycling(type, distance, duration, [lat, lng], elevation);
    }

    this.#workout.push(workout);

    this._randerWorkoutMarker(workout);
    this._randerWorkout(workout);
    this._hideForm();
    this._setLocalStorage();
  }
  _randerWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          // closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .openPopup()
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.type
          .slice(0, 1)
          .toLocaleUpperCase()}${workout.type.slice(
          1
        )} on ${new Intl.DateTimeFormat(
          'en-Us',
          { day: 'numeric', month: 'long' }
          // { dateStyle: 'short' }
        ).format(workout.date)}`
      );
  }
  _randerWorkout(workout) {
    form.insertAdjacentHTML(
      'afterend',
      `<li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.type
      .slice(0, 1)
      .toLocaleUpperCase()}${workout.type.slice(
        1
      )} on ${new Intl.DateTimeFormat(
        'en-Us',
        { day: 'numeric', month: 'long' }
        // { dateStyle: 'short' }
      ).format(workout.date)}</h2>
    <div class="workout__details">
      <span class="workout__icon"> ${
        workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${
        workout.type === 'running'
          ? workout.pace.toFixed(1)
          : workout.speed.toFixed(1)
      } </span>
      <span class="workout__unit">${
        workout.type === 'running' ? 'min/km' : 'km/h'
      }</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🦶🏼' : '⛰'
      }</span>
      <span class="workout__value">${
        workout.type === 'running' ? workout.cadence : workout.elevationGain
      }</span>
      <span class="workout__unit">${
        workout.type === 'running' ? 'spm' : 'm'
      }</span>
    </div>
  </li>`
    );
  }
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workout));
  }
  _getLocalStorage() {
    this.#workout = JSON.parse(localStorage.getItem('workouts'));
    for (const i of this.#workout) {
      i.date = new Date(i.date);
      this._randerWorkoutMarker(i);

      // L.marker(i.coords);
      // .addTo(this.#map)
      // .bindPopup(
      //   L.popup({
      //     maxWidth: 250,
      //     minWidth: 100,
      //     autoClose: false,
      //     // closeOnClick: false,
      //     className: `${i.type}-popup`,
      //   })
      // )
      // .openPopup()
      // .setPopupContent(
      //   `${i.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${i.type
      //     .slice(0, 1)
      //     .toLocaleUpperCase()}${i.type.slice(
      //     1
      //   )} on ${new Intl.DateTimeFormat(
      //     'en-Us',
      //     { day: 'numeric', month: 'long' }
      //     // { dateStyle: 'short' }
      //   ).format(i.date)}`
      // );

      this._randerWorkout(i);
    }
  }
}
class Workout {
  click = 0;
  date = new Date();
  id = Date.now().toString().slice(-10);

  constructor(type, distance, duration, coords) {
    this.type = type;
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
  }
  clicks() {
    this.click++;
  }
}
class Running extends Workout {
  constructor(type, distance, duration, coords, cadence) {
    super(type, distance, duration, coords);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  constructor(type, distance, duration, coords, elevationGain) {
    super(type, distance, duration, coords);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
// const running = new Running();
// console.log(running.tess());
const app = new App();

// form.addEventListener('submit', event => {
//   event.preventDefault();
//   inputDistance.value =
//     inputDuration.value =
//     inputCadence.value =
//     inputElevation.value =
//       '';

//   const {
//     latlng: { lat, lng },
//   } = mapEvent;
//   L.marker([lat, lng])
//     .addTo(map)
//     .bindPopup(
//       L.popup({
//         maxWidth: 250,
//         minWidth: 100,
//         autoClose: false,
//         // closeOnClick: false,
//         className: 'running-popup',
//       })
//     )
//     .openPopup()
//     .setPopupContent('Workout');
// });

// inputType.addEventListener('change', () => {
//   inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
//   inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
// });
