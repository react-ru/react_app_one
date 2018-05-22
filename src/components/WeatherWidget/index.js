import React, {PureComponent} from 'react'

import iconsDictionary from '../../icons.dictionary';

import PlacesAutocomplete from 'react-places-autocomplete';
// TODO: [🐱👀] Стиль пробелов в import-ах разный:
// Выше на с. 1 импорт без пробелов вокруг скобок, а на этой строчке с пробелами.
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete'

import './style.css';


class WeatherWidget extends PureComponent {

    state = {

        city: null,
        country: null,

        startDate: null,
        weather: null,

        // TODO: [🐱👀] Здесь и на с. 54, 537 `currentDayNumber` всегда 0. Можно избавиться от этой переменной.
        currentDayNumber: null,
        currentDaytimeNumber: null,

        daysNumber: 5,
        geolocation: true,

        citySelect: true,
        address: '',
    };

    componentWillMount() {

        let appState = {
            // TODO: [🐱👀] Здесь и на с. 55, 119, 225, 458, 555, 562, 568, 569
            // Несколько раз в коде вычисляется `new Date`.
            // Можно обойтись одной переменной.
            currentDaytimeNumber: Math.floor((new Date()).getHours()/3)
        };

        // TODO: [🐱👀] Два раза читается значение из `localStorage`-а, можно использовать дополнительную переменную.
        if(localStorage.getItem('weatherAppTemperatureMode')){
            appState.temperatureMode = localStorage.getItem('weatherAppTemperatureMode');
        }

        this.setState(appState);

        this.sePeriodEndTimer();
        this.setDayEndTimer();

        this.initApp();

    };

    render() {
        // TODO: [🐱👀] Здесь и ниже:
        // Много кода зависит от наличия значения в переменной `weather`.
        // Было бы проще один раз проверить значение переменной и пойти по default-ветке.
        const weather = this.state.weather;

        const today = weather && weather[this.state.currentDayNumber],
            now = new Date(),
            nowHours = Math.floor(now.getHours()/3);

        const currentDescription = weather && today.description;
        const currentTemp = weather && today.weather.byHours[nowHours].temp;
        const currentIcon = weather && iconsDictionary[today.weather.byHours[nowHours].icon];

        const weatherList = weather && weather
            .map(daily =>
                <div key = { Math.random().toString(36).substr(2, 9) } className="WW_cell WW_cell__daily">
                    {   //        ↑↑↑↑↑↑↑↑
                        // TODO: [🐱👀] Вместо random-ных ключей можно использовать индексы.
                        // Ключ, полученный с помощью операции `random` мешает реконсайлеру.
                        // https://reactjs.org/docs/lists-and-keys.html#keys
                    }

                    <div className="WW_daily-weekday">{daily.weekDay}</div>

                    <i className = { `WW_daily-icon wi ${iconsDictionary[daily.weather.byHours[4].icon]}` }> </i>

                    <div className="WW_daily-temp">{this.getTemperatureString(daily.weather.byDaytimes[2])}</div>
                </div>);

        const daytimes = ['Night', 'Morning', 'Day', 'Evening'];
        const weatherDuringTheDay = today && today.weather.byDaytimes.map((t, i) =>
            <div key = { Math.random().toString(36).substr(2, 9) } className="WW__during-the-day_row">
                <span className="WW__during-the-day_name">{daytimes[i]}</span>
                <span className="WW__during-the-day_temp">
                    {this.getTemperatureString(t)}
                </span>
            </div>
        );

        // TODO: [🐱👀] Зачем так?
        if(weatherDuringTheDay)weatherDuringTheDay.push(weatherDuringTheDay.shift());

        return (
            <div className="WW">

                <div className={`WW_table${!this.state.citySelect ? ' WW_table__active' : ''}`}>

                    <div className="WW_row WW_row__justify">

                        <div className="WW_cell WW_cell__city">

                            {
                                // TODO: [🐱👀] `.bind` вернет копию функции, а не оригинальную функцию.
                                // Это сделает невозможным оптимизацию производительности с помощью `PureComponent`-ов.
                                // Рекомендую каждый раз использовать при-bind-енный метод.
                                // https://medium.freecodecamp.org/the-best-way-to-bind-event-handlers-in-react-282db2cf1530
                            }
                            <div className="WW_city-change" onClick={this.citySelectShow.bind(this)}> </div>

                            <span className="WW_city-name">
                            {
                                // TODO: [🐱👀] Шаблон здесь избыточен, `{this.state.city}, {this.state.country}` — будет в самый раз.
                            }
                            {`${this.state.city}, ${this.state.country}`}
                        </span>

                        </div>

                        <div className="WW_cell WW_cell__switcher" onClick={this.switchTemperatureMode}>

                            <div className={`WW_switcher${this.state.temperatureMode === 'C' ? ' WW_switcher__active' : ''}`}>
                                <div className="WW_switcher_lever">
                                    <div className="wi wi-fahrenheit"></div>
                                    <div className="wi wi-celsius"></div>
                                </div>
                            </div>

                        </div>

                    </div>

                    {
                        // TODO: [🐱👀] Здесь и в похожих местах выводится `undefined`. Более корректно писать так, чтобы не было пустых блоков в разметке:
                        // ``` javascript
                        // {
                        //   weatherDuringTheDay && (
                        //     <div className=“WW_cell WW_cell__during-the-day”>
                        //       {
                        //         weatherDuringTheDay
                        //       }
                        //     </div>
                        //   )
                        // }
                        // ```
                    }
                    <div className="WW_row">
                        <div className="WW_cell WW_cell__full">

                            <div className="WW_date-string">
                                {this.getDateString(new Date())}
                            </div>

                        </div>
                    </div>

                    <div className="WW_row">
                        <div className="WW_cell WW_cell__full">
                            <div className="WW_weather-description">
                                {currentDescription}
                            </div>
                        </div>
                    </div>

                    <div className="WW_row">

                        <div className="WW_cell WW_cell__degrees">
                            {this.getTemperatureString(currentTemp)}
                        </div>

                        <div className="WW_cell WW_cell__weather-icon">
                            <i className = { `WW_daily-icon wi ${currentIcon}` } > </i>

                        </div>

                        <div className="WW_cell WW_cell__during-the-day">
                            {weatherDuringTheDay}
                        </div>

                    </div>

                    <div className="WW_row WW_row__justify">

                        {weatherList}

                    </div>

                </div>

                <div className={`WW_overlay${this.state.citySelect ? ' WW_overlay__active' : ''}`}>

                    <div
                        onClick={ ()=>{this.setState({citySelect: false})} }
                        className={ `WW_overlay_return ${!this.state.city ? ' hidden' : ''}` }
                        > </div>

                        <div className="WW_overlay_city">

                        <PlacesAutocomplete
                            value={this.state.address}
                            onChange={this.citySelectChange.bind(this)}
                            onSelect={this.citySelectAccept.bind(this)}
                            searchOptions={{ types: ['(cities)'] }}
                        >
                            {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                                <div>
                                    <input
                                        {...getInputProps({
                                            placeholder: 'City',
                                            className: 'WW_autocomplete-input'
                                        })}
                                    />
                                    <div className="WW_autocomplete-drop">
                                        {suggestions.map(suggestion => {

                                            const className = suggestion.active ? 'WW_autocomplete-drop_item WW_autocomplete-drop_item__active' : 'WW_autocomplete-drop_item';

                                            return (
                                                <div {...getSuggestionItemProps(suggestion, { className })}>
                                                    <span>{suggestion.description}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </PlacesAutocomplete>

                        {this.state.geolocation ? <div className="WW_overlay_current-position"><span>or</span><span>use my <a onClick={this.resetPosition.bind(this)}>current position</a></span></div> : ''}

                    </div>

                </div>

            </div>
        )
    }

    // Helpers //
    // TODO: [🐱👀] Код для работы с датами может быть заменен на хорошо известные и проверенные библиотеки для работы со временем:
    // http://momentjs.com/
    // https://date-fns.org/
    getDateString = (date) => {

        const month = ['January','February','March','April','May','June','July','August','September','October','November','December'],
            // TODO: [🐱👀] Здесь и на с 457 Дублирование определений дней недели.
            week = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

        return `${week[date.getDay()]}, ${month[date.getMonth()]} ${this.getNumberWithSuffix(date.getUTCDate())} ${date.getFullYear()}`;
    };

    getNumberWithSuffix = (n) => {
        const s = ["th","st","nd","rd"],
            v=n%100;

        return n+(s[(v-20)%10]||s[v]||s[0]);
    };

    getNowDateString = () => {
        const now = new Date();
        return `${now.getFullYear()}/${ now.getMonth()}/${now.getDate()}`;
    };

    getTemperature = (t) => this.state.temperatureMode === 'C' ? t : Math.round(9/5*t + 32);
    getTemperatureString = (t) => <span>{this.getTemperature(t)}<i className={`wi wi-${this.state.temperatureMode === 'C' ? 'celsius' : 'fahrenheit'}`}></i></span>;



    // Geolocation

    getBrowserGeolocation = () => {

        if (navigator.geolocation) {
            return new Promise(
                (resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject)
            )
        } else {
            // TODO: [🐱👀] Здесь можно использовать `Promise.resolve({})`.
            return new Promise(
                resolve => resolve({})
            )
        }
    };

    checkSelfPosition = (position) => {

        return new Promise((resolve, reject) => {

            const previousPosition = localStorage.getItem('weatherAppPosition') ? JSON.parse(localStorage.getItem('weatherAppPosition')) : null;

            if(previousPosition){

                this.setState({...previousPosition});

                resolve( previousPosition );

            }
            else {

                const geocoder = new window.google.maps.Geocoder();
                const latlng = new window.google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                geocoder.geocode({ location: latlng }, (results, status) => {

                    if (status === window.google.maps.GeocoderStatus.OK) {

                        if (results[0]) {

                            const value = results.find(r => r.types.indexOf('administrative_area_level_1') !== -1);
                            const city = value.formatted_address.split(',')[0];
                            const country = value.formatted_address.split(', ')[1];

                            const newPosition = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                                city,
                                country
                            };

                            localStorage.setItem('weatherAppPosition', JSON.stringify(newPosition));

                            this.setState({ ...newPosition });

                            resolve( newPosition );

                        } else {
                            // TODO: [🐱👀] Ошибки нигде не обрабатываются.
                            reject(["address not found", results]);
                        }

                    } else {
                        // TODO: [🐱👀] Ошибки нигде не обрабатываются.
                        reject(["request error", status]);
                    }

                });


            }


        })

    };

    resetPosition = () => {
        localStorage.removeItem('weatherAppPosition');
        localStorage.removeItem('weatherAppData');
        this.initApp();
    };

    // city select autocomplete

    citySelectShow = () => {
        this.setState({
            citySelect: true,
            address: ''
        });

    };

    citySelectChange = address => {
        this.setState({ address });
    };

    citySelectAccept = address => {

        geocodeByAddress(address)
            .then(results => getLatLng(results[0]))
            .then(position => {

                const addressArr = address.split(', '),
                    city = addressArr[0],
                    country = addressArr[addressArr.length - 1];

                // TODO: [🐱👀] c. 345 Дублирование одного объекта.
                localStorage.setItem('weatherAppPosition', JSON.stringify({
                    ...position,
                    city,
                    country
                }));

                this.setState({
                    ...position,
                    city,
                    country
                });

                this.requestAppData(position);
            })
            .catch(error => console.error('Error', error))

    };


    // Switcher

    switchTemperatureMode = () => {
        const newState =  this.state.temperatureMode === 'C' ? 'F' : 'C';

        this.setState({
            temperatureMode: newState
        });

        localStorage.setItem('weatherAppTemperatureMode', newState);
    };

    // Application start //

    initApp = () => {

        this.getBrowserGeolocation()
            .then(
                position => this.checkSelfPosition(position)
            )
            .then(
                position => this.loadWeatherData(position),
                err => {
                    // TODO: [🐱👀] Здесь я затрудняюсь в интерпретации;
                    // С одной стороны, обработчик, судя по тексту ошибки, использован верно, он действительно выведет ошибку если геолокация недоступна.
                    // Однако, не понятно, ожидал ли автор что обработчик `err => ..` не вызовется, если исключение возникнет при исполнении `position =>`.
                    // Если не ожидал, то это ошибка.
                    console.warn('Geolocation disabled', err);

                    this.setState({
                        geolocation: false
                    });

                    this.loadWeatherData();
                }
            );

    };

    loadWeatherData = (position) => {

        const weatherAppData = localStorage.getItem('weatherAppData') ? JSON.parse(localStorage.getItem('weatherAppData')) : null,
            weatherAppPosition = localStorage.getItem('weatherAppPosition') ? JSON.parse(localStorage.getItem('weatherAppPosition')) : null;

        if(weatherAppData && weatherAppPosition && weatherAppData.startDate === this.getNowDateString()){

            this.startApp({
                ...weatherAppData,
                ...weatherAppPosition
            });

        }
        else {

            if(position) this.requestAppData(position);

        }

    };

    requestAppData = (position) => {

        new Promise((resolve, reject) => {

            // TODO: [🐱👀] Ручную работу с `XMLHttpRequest` можно заменить на новое Fetch API или axios от нашего соотечественника.
            // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
            // https://github.com/axios/axios
            const xhr = new XMLHttpRequest();

            // xhr.open('GET', `http://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${this.props.apiKeys.openWeatherMaps}`, true);
            xhr.open('GET', `https://api.openweathermap.org/data/2.5/forecast?lat=${position.lat}&lon=${position.lng}&APPID=${this.props.apiKeys.openWeatherMaps}`, true);

            xhr.onload = function() {
                if (this.status === 200) {
                    resolve(this.response);
                } else {
                    const error = new Error(this.statusText);
                    error.code = this.status;
                    reject(error);
                }
            };

            xhr.onerror = () => {
                reject(new Error("Network Error"));
            };

            xhr.send();

        }).then(
            response => {

                const weatherAppData = this.parseAppData(JSON.parse(response));

                localStorage.setItem('weatherAppData', JSON.stringify(weatherAppData));

                this.startApp({
                    ...weatherAppData,
                    citySelect: false
                });

            },
            error => console.log(error)
        );
    };

    // TODO: [🐱👀] Не увидел через отладчик, что информация запрашивается повторно.
    // В требованиях была такая строчка: "but in background, app should ask about new data"
    parseAppData = (raw_data) => {

        const week = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
            todayWeekDayNumber = (new Date()).getDay();

        const weatherByDays = raw_data.list

            // get 20 periods [ [0,1,2], ...etc ]
            .reduce((periods, item, i) => {

                // TODO: [🐱👀] Насколько я понял, прогнав код через дебагер, эта функция раскладывает массив периодов на массив троек.
                // При этом последний элемент каждой тройки совпадает с первым элементом следующей за ней тройкой.
                // Не понятно, зачем так.
                periods[periods.length-1].push(item);

                if(!(i%2) && i) periods.push([item]);

                return periods;

            }, [[]])

            // get this.state.daysNum days [ [night,morning,day,evening] , ...etc ]
            .reduce((days, item, i, arr) => {

                days[days.length-1].push(item);

                // TODO: [🐱👀] Не понятно, что делает и зачем этот код:
                if(!((i+1)%(this.state.daysNumber-1)) && i !== arr.length-1) days.push([]);

                return days;

            }, [[]])

            // get days data objects
            .map((day, dayIndex) => {

                const currentWeekDay = (todayWeekDayNumber + dayIndex)%7;
                // TODO: [🐱👀] Понятно, почему такой выбор — нужно взять погоду в середине дня.
                // Более точно было бы взять погоду за текущий период.
                const currentDescription = day[2][0].weather[0].description;

                const dayData = {

                    weather: {
                        byDaytimes: [0,0,0,0],
                        byHours: []
                    },
                    description: currentDescription[0].toUpperCase() + currentDescription.substr(1),
                    weekDay: week[currentWeekDay]


                };



                day.forEach((daytime, dayTimeIndex) => {

                    
                    let daytimeTemp = 0;

                    daytime.forEach((threeHours, i) => {

                        const tempInC = Math.round(threeHours.main.temp - 273.15);

                        if(i !== 2) dayData.weather.byHours.push({
                            temp: tempInC,
                            icon: threeHours.weather[0].icon
                        });

                        daytimeTemp += tempInC;

                    }, 0); // TODO: [🐱👀] видимо, раньше на 506-й был `.reduce` )

                    dayData.weather.byDaytimes[dayTimeIndex] = Math.round(daytimeTemp/3);

                });

                return dayData;

            });
        
        console.log(weatherByDays); // TODO: [🐱👀] Лишний `console.log`

        return {

            weather: weatherByDays,
            startDate: this.getNowDateString(),
            currentDayNumber: 0

        };
    };

    startApp = (data) => {

        // console.log(data);

        this.setState({
            ...data,
            citySelect: false
        });

    };

    setDayEndTimer = () => {

        const now = new Date();

        setTimeout( () => {

            this.requestAppData(this.state);
            this.setDayEndTimer();

        }, new Date(now.getFullYear(), now.getMonth(), now.getDate()+1) - now);

    };

    // TODO: [🐱👀] Наверное, имелось в виду `setPeriodEndTimer`
    sePeriodEndTimer = () => {

        const now = new Date();
        const nowMilliseconds = 24*60*60*1000 - (new Date(now.getFullYear(), now.getMonth(), now.getDate()+1) - now);

        setTimeout(() => {

            this.setState({
                currentDaytimeNumber: this.state.currentDaytimeNumber !== 7 ? this.state.currentDaytimeNumber + 1 : 0
            });

            this.sePeriodEndTimer();

        }, 10800000 - nowMilliseconds % (3*60*60*1000));

    };


}

export default WeatherWidget