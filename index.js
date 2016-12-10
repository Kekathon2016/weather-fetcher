var config = require('config');

var WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({ port: config.get("port") });

var ForecastIo = require('forecastio');

var forecastIo = new ForecastIo(config.get("darkskyApiKey"));

var currentWeather = null;

function sendWeather(ws) {
    ws.send(JSON.stringify({
        type: 'weather',
        data: currentWeather
    }), err => {
        if (err) {
            console.error("sending error", err);
        }
    });
}

function sendWeatherToAll() {
    wss.clients.forEach(sendWeather);
}

function performUpdate() {
     forecastIo.forecast(config.get('lat'), config.get('lon'))
        .then(data => {
            currentWeather = data
            console.log("got update");
        })
        .catch(err => {
            console.error("Couldn't fetch data", err);
        });   
}

performUpdate();
setInterval(performUpdate, 15 * 60 * 1000); // 15min

wss.on('connection', ws => {
    console.log("connected");
    sendWeather(ws);

    ws.on('close', () => {
        console.log("disconnected");
    });
});