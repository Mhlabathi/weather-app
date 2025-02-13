import "./styles.css";
import { format, formatDistance, formatRelative, subDays } from 'date-fns';
import { icons } from './iconsSVG.js';


const form = document.querySelector( 'form' );
const searchInput = document.getElementById('search');
const submitBtn = document.getElementById('submit-btn');

const weatherSummary = document.querySelector( '.weather-summary' );
const weatherLocation = document.querySelector( '.location' );
const weatherTemp = document.querySelector( '.temperatures' );
const weatherCondition = document.querySelector( '.conditions' );
const weatherIcon = document.getElementById('icon');
weatherIcon.className = "weather-icon";

const hourlyWeather = document.querySelector( 'hourly-weather' );
const weatherDescr = document.querySelector( '.description' );
const weatherHours = document.querySelector( '.hours' );
const weatherForecast = document.querySelector( '.forecast' );

const scaleChange = document.getElementById('scale');
let currentCity = 'Durban';

scaleChange.addEventListener('change', (e) => {
    searchWeather(currentCity);
});


submitBtn.addEventListener( 'click', (event) => {
    event.preventDefault();
    searchWeather( searchInput.value );
});

searchInput.addEventListener( 'keyup', (event) => {
    searchWeather( searchInput.value )
});

function searchWeather( forCity ) {
    getWeatherData( forCity )
    .then( weatherData => {
        console.log( weatherData );
        return processWeatherDataObj( weatherData );
    })
    .then( displayWeatherObj => {
        console.log( "Obj: " + displayWeatherObj.fiveDays[0] );
        displayWeather( displayWeatherObj );
    });;
}

async function getWeatherData( city ) {
    currentCity = city;
    const wKey = "XGB7KF9RWZ2BQX5L49KB3TCRP";
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?key=${wKey}`;

    const response = await fetch(url, {mode: "cors"});
    const responseData = await response.json();

    console.log( responseData );
    return responseData;

}

function cToF(celsius) {
    return Math.ceil((celsius * 9 / 5) + 32);
}

function fToC(farenheit) {
    return Math.ceil((farenheit - 32) * (5/9));
}

async function processWeatherDataObj( weatherData ){

    const fiveDaysDetails = [];

    return await new Promise( resolve =>{

        //Generate hourly Forecast
        const hours = weatherData.days[0].hours;
        const hourDataList = [];

        hours.forEach( (hour, index) => {
            let am_pm;
            if ( index < 10 ) { 
                am_pm = `0${index}:00`;
            } else {
                am_pm = `${index}:00`;
            }

            let hourlyDataObj = {
                hour: am_pm,
                icon: hour.icon,
                tempSign: "C",
                temp: {"F": hour.temp, "C": fToC(hour.temp)}
            }
            hourDataList.push( hourlyDataObj );
        });
        

        //Generate five days forecast
        let i;
        for ( i = 0; i < 8; i++) {
            let dayData = weatherData.days[i];
            let day =  format( new Date(dayData.datetime), "eeee");
            let dayObj = {
                date: day,
                tempSign: "C",
                temp: {"F": dayData.temp, "C": fToC(dayData.temp)},
                icon: dayData.icon,
                summary: dayData.conditions
            }

            fiveDaysDetails.push(dayObj);
        }

       const  weatherDataObj = {
            tempSign: "C",
            temp: {"F": weatherData.currentConditions.temp, "C": fToC( weatherData.currentConditions.temp), },
            hourly: hourDataList,
            fiveDays: fiveDaysDetails,
            conditions: weatherData.currentConditions.conditions,
            feelsLike: weatherData.currentConditions.feelslike,
            humidity: weatherData.currentConditions.humidity,
            icon: weatherData.currentConditions.icon,
            precipitation: weatherData.currentConditions.precip,
            precipProb: weatherData.currentConditions.precipprob,
            uvIndex: weatherData.currentConditions.uvindex,
            windSpeed: weatherData.currentConditions.windspeed,
            dateTime: weatherData.currentConditions.datetime,
            description: weatherData.description,
            city: weatherData.resolvedAddress
        }
        
        return resolve(weatherDataObj);
    });
}

function displayWeather(wObj) {
    console.log( `******Your Weather for Today in ${wObj.city} ******` );
    weatherLocation.textContent = `${wObj.city}`;
    if( scaleChange.value === "C" ){
        console.log( `Temperature: ${wObj.temp["C"]}` );
        weatherTemp.textContent = `${wObj.temp["C"]}° C`;
    } else {
        console.log( `Temperature: ${wObj.temp["F"]}` );
        weatherTemp.textContent = `${wObj.temp["F"]}° F`;``
    }
    
    console.log( `Conditions: ${wObj.conditions}` );
    weatherCondition.textContent = `${wObj.conditions}`;
    weatherIcon.src = icons[wObj.icon];
    console.log( `Icon: ${wObj.icon}` );
    console.log( `Time: ${wObj.dateTime} ${wObj.fiveDays[0].date}`);
    console.log( `Rain Probability: ${wObj.precipProb}` );

    console.log( `********Hourly updates*******` );
    weatherDescr.textContent = wObj.description;
    weatherHours.replaceChildren("");
    for (let i = 0; i < 24; i++) {
        console.log( `Hour: ${wObj.hourly[i].hour} - Temp: ${wObj.hourly[i].temp} - Icon: ${wObj.hourly[i].icon}`)
        displayHourWeather( wObj.hourly[i] );
        
    }

    console.log( `*******Next Five Days*******` );
    weatherForecast.replaceChildren("");
    for ( let i = 1; i < 8; i++ ){
        console.log ( `Day: ${wObj.fiveDays[i].date} - Temp: ${wObj.fiveDays[i].temp} - Condition: ${wObj.fiveDays[i].summary}` );
        displayForecast( wObj.fiveDays[i] );
    }
}

function displayHourWeather( hourWeather ) {
    let hourDiv = document.createElement('div');
    hourDiv.classList.add('hourDiv');
    let hourTime = document.createElement('h4');
    let hourTemp = document.createElement('h6');
    let hourIcon = document.createElement('img');
    hourIcon.className = "hour-icon";
    hourIcon.src = icons[hourWeather.icon];
    hourDiv.appendChild(hourTime);
    hourDiv.appendChild(hourIcon);
    hourDiv.appendChild(hourTemp);
    weatherHours.appendChild(hourDiv);


    hourTime.textContent = hourWeather.hour;
    if( scaleChange.value === "C" ){
        hourTemp.textContent = `${hourWeather.temp["C"]}° C`;
    } else {
        hourTemp.textContent = `${hourWeather.temp["F"]}° F`;
    }
}

function displayForecast( forecast ) {
    let nextDay = document.createElement('div');
    nextDay.classList.add('nextDayDiv');
    weatherForecast.appendChild(nextDay);
    let nextDayName = document.createElement('h4');
    let nextDayTemp = document.createElement('h3');
    let nextDayIcon = document.createElement('img');
    nextDayIcon.className = "next-day-icon";
    nextDayIcon.src = icons[forecast.icon];
    let nextDaySummary = document.createElement('p');
    nextDay.appendChild(nextDayName);
    nextDay.appendChild(nextDayTemp);
    nextDay.appendChild(nextDayIcon);
    nextDay.appendChild(nextDaySummary);

    nextDayName.textContent = forecast.date;
    if( scaleChange.value === "C" ){
        nextDayTemp.textContent = `${forecast.temp["C"]}° C`;
    } else {
        nextDayTemp.textContent = `${forecast.temp["F"]}° F`;
    }
    nextDaySummary.textContent = forecast.summary;

}

// getWeatherData()
// .then( weatherData => {
//     console.log( weatherData );
//     return processWeatherDataObj( weatherData );
// })
// .then( displayWeatherObj => {
//     console.log( "Obj: " + displayWeatherObj.fiveDays[0] );
//     displayWeather( displayWeatherObj );
// });