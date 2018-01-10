const jfive = require("johnny-five");
const WebSocketServer = new require('ws');

const data = { celsius: 0, fahrenheit: 0 };

const webSocketServer = new WebSocketServer.Server({
	port: 3003
});

const clients = new Set();

const board = new jfive.Board();

function send(client){
	client.send(JSON.stringify(data));
}

board.on("ready", () => {
	const tempSensor = new jfive.Thermometer({
		controller: "LM335", //"TMP36",
		pin: "A0"
	});

	tempSensor.on("data", function() {
		const delta = this.celsius - data.celsius;
		if(delta > 0.5 || delta < -0.5){
			console.log(this.celsius.toFixed(2) + "°C", this.fahrenheit.toFixed(2) + "°F");

			data.celsius 	= this.celsius;
			data.fahrenheit = this.fahrenheit;

			clients.forEach(send);
		}
	});

	webSocketServer.on('connection', ws => {
		clients.add(ws);

		send(ws);

		ws.on('close', () => clients.delete(ws));
	});
});