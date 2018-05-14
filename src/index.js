import React from 'react'
import {render} from 'react-dom'

import './css/style.css'

import WeatherWidget from './components/WeatherWidget/'
import GoogleMapsLoader from 'google-maps';

GoogleMapsLoader.KEY = 'AIzaSyAltous49X2T8qgWeUYMKSerKCCWUkoeso'; //https://stackoverflow.com/a/1364883/6122070
GoogleMapsLoader.LANGUAGE = 'en';
GoogleMapsLoader.LIBRARIES = ['places'];

GoogleMapsLoader.load(() => {

    render(<WeatherWidget apiKeys = {{openWeatherMaps: '636508fa14336da5ac9aa76348ce906b'}} temperatureMode = "C" />, document.getElementById('root'));

});