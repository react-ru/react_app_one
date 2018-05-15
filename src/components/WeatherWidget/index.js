import React, {PureComponent} from 'react'

import iconsDictionary from '../../icons.dictionary';

import PlacesAutocomplete from 'react-places-autocomplete';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete'

import './style.css';


class WeatherWidget extends PureComponent {

    state = {

        city: null,
        country: null,

        startDate: null,
        weather: null,

        currentDayNumber: null,
        currentDaytimeNumber: null,

        daysNumber: 5,
        geolocation: true,

        citySelect: true,
        address: '',
    };

    componentWillMount() {

        let appState = {
            currentDaytimeNumber: Math.floor((new Date()).getHours()/3)
        };

        if(localStorage.getItem('weatherAppTemperatureMode')){
            appState.temperatureMode = localStorage.getItem('weatherAppTemperatureMode');
        }

        this.setState(appState);

        this.sePeriodEndTimer();
        this.setDayEndTimer();

        this.initApp();

    };

    render() {

        let weather = this.state.weather;

        let today = weather && weather[this.state.currentDayNumber],
            now = new Date(),
            nowHours = Math.floor(now.getHours()/3);

        let currentDescription = weather && today.description;
        let currentTemp = weather && today.weather.byHours[nowHours].temp;
        let currentIcon = weather && iconsDictionary[today.weather.byHours[nowHours].icon];

        let weatherList = weather && weather
            .map(daily =>
                <div key = { Math.random().toString(36).substr(2, 9) } className="WW_cell WW_cell__daily">

                    <div className="WW_daily-weekday">{daily.weekDay}</div>

                    <i className = { `WW_daily-icon wi ${iconsDictionary[daily.weather.byHours[4].icon]}` }> </i>

                    <div className="WW_daily-temp">{this.getTemperatureString(daily.weather.byDaytimes[2])}</div>
                </div>);

        let daytimes = ['Night', 'Morning', 'Day', 'Evening'];
        let weatherDuringTheDay = today && today.weather.byDaytimes.map((t, i) =>
            <div key = { Math.random().toString(36).substr(2, 9) } className="WW__during-the-day_row">
                <span className="WW__during-the-day_name">{daytimes[i]}</span>
                <span className="WW__during-the-day_temp">
                    {this.getTemperatureString(t)}
                </span>
            </div>
        );

        if(weatherDuringTheDay)weatherDuringTheDay.push(weatherDuringTheDay.shift());

        return (
            <div className="WW">

                <div className={`WW_table${!this.state.citySelect ? ' WW_table__active' : ''}`}>

                    <div className="WW_row WW_row__justify">

                        <div className="WW_cell WW_cell__city">

                            <div className="WW_city-change" onClick={this.citySelectShow.bind(this)}> </div>

                            <span className="WW_city-name">
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

    getDateString = (date) => {

        let month = ['January','February','March','April','May','June','July','August','September','October','November','December'],
            week = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

        return `${week[date.getDay()]}, ${month[date.getMonth()]} ${this.getNumberWithSuffix(date.getUTCDate())} ${date.getFullYear()}`;
    };

    getNumberWithSuffix = (n) => {
        let s = ["th","st","nd","rd"],
            v=n%100;

        return n+(s[(v-20)%10]||s[v]||s[0]);
    };

    getNowDateString = () => {
        let now = new Date();
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
            return new Promise(
                resolve => resolve({})
            )
        }
    };

    checkSelfPosition = (position) => {

        return new Promise((resolve, reject) => {

            let previousPosition = localStorage.getItem('weatherAppPosition') ? JSON.parse(localStorage.getItem('weatherAppPosition')) : null;

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
                            reject(["address not found", results]);
                        }

                    } else {
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

                let addressArr = address.split(', '),
                    city = addressArr[0],
                    country = addressArr[addressArr.length - 1];

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
        let newState =  this.state.temperatureMode === 'C' ? 'F' : 'C';

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
                    console.warn('Geolocation disabled', err);

                    this.setState({
                        geolocation: false
                    });

                    this.loadWeatherData();
                }
            );

    };

    loadWeatherData = (position) => {

        let weatherAppData = localStorage.getItem('weatherAppData') ? JSON.parse(localStorage.getItem('weatherAppData')) : null,
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

            let xhr = new XMLHttpRequest();

            // xhr.open('GET', `http://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${this.props.apiKeys.openWeatherMaps}`, true);
            xhr.open('GET', `http://api.openweathermap.org/data/2.5/forecast?lat=${position.lat}&lon=${position.lng}&APPID=${this.props.apiKeys.openWeatherMaps}`, true);

            xhr.onload = function() {
                if (this.status === 200) {
                    resolve(this.response);
                } else {
                    let error = new Error(this.statusText);
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

                let weatherAppData = this.parseAppData(JSON.parse(response));

                localStorage.setItem('weatherAppData', JSON.stringify(weatherAppData));

                this.startApp({
                    ...weatherAppData,
                    citySelect: false
                });

            },
            error => console.log(error)
        );
    };

    parseAppData = (raw_data) => {

        let week = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
            todayWeekDayNumber = (new Date()).getDay();

        let weatherByDays = raw_data.list

            // get 20 periods [ [0,1,2], ...etc ]
            .reduce((periods, item, i) => {

                periods[periods.length-1].push(item);

                if(!(i%2) && i) periods.push([item]);

                return periods;

            }, [[]])

            // get this.state.daysNum days [ [night,morning,day,evening] , ...etc ]
            .reduce((days, item, i, arr) => {

                days[days.length-1].push(item);

                if(!((i+1)%(this.state.daysNumber-1)) && i !== arr.length-1) days.push([]);

                return days;

            }, [[]])

            // get days data objects
            .map((day, dayIndex) => {

                let currentWeekDay = todayWeekDayNumber + dayIndex;
                if(currentWeekDay > 6) currentWeekDay = 0;

                let currentDescription = day[2][0].weather[0].description;

                let dayData = {

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

                        let tempInC = Math.round(threeHours.main.temp - 273.15);

                        if(i !== 2) dayData.weather.byHours.push({
                            temp: tempInC,
                            icon: threeHours.weather[0].icon
                        });

                        daytimeTemp += tempInC;

                    }, 0);

                    dayData.weather.byDaytimes[dayTimeIndex] = Math.round(daytimeTemp/3);

                });

                return dayData;

            });

        console.log(weatherByDays);

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

        let now = new Date();

        setTimeout( () => {

            this.requestAppData(this.state);
            this.setDayEndTimer();

        }, new Date(now.getFullYear(), now.getMonth(), now.getDate()+1) - now);

    };

    sePeriodEndTimer = () => {

        let now = new Date();
        let nowMilliseconds = 24*60*60*1000 - (new Date(now.getFullYear(), now.getMonth(), now.getDate()+1) - now);

        setTimeout(() => {

            this.setState({
                currentDaytimeNumber: this.state.currentDaytimeNumber !== 7 ? this.state.currentDaytimeNumber + 1 : 0
            });

            this.sePeriodEndTimer();

        }, 10800000 - nowMilliseconds % (3*60*60*1000));

    };


}

export default WeatherWidget