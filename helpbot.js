var _=require('underscore')
// var request=require('JSON')
// ./bin/www
var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')

var connection = process.env.MONGODB_URI
if (!connection) {
	connection = require('./config')
}
mongoose.connect(connection)
var request = require('request');
var api = require('./config')
var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
var apiToken = api.apiTok
// var token = apiToken;
console.log('\n\n\n')
console.log(api)
console.log(api.apiTok)
console.log(apiToken)
console.log(token+'\n\n\n')
var rtm = new RtmClient(token, {logLevel: 'debug'});
rtm.start(); 

var usersUrl = 'https://slack.com/api/users.list?token='
var helpers = ['ethan','moose','lando','joshpaulchan','abhi','lane','darwish']

var channels = ['testbot','help']
// var chID = 'C1FLCK3KL'
var TAindex = 0

function getMembers(cb) {
	request(usersUrl+api.apiTok, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log('getMembers: '+JSON.parse(body).members.length)
			var members=JSON.parse(body).members
			var helperIDs = []
			_.forEach(members, function(element) {
				if (helpers.indexOf(element.name)!==-1) {
					helperIDs.push(element.id)
					console.log('Adding '+element.name+' to helper IDs')
				}
			})
			cb(helperIDs)
		}
	})
}

var getTAindex = function(helperIDs) {
	var temp = rtm.dataStore.getUserById(helperIDs[TAindex])
	console.log(temp.real_name+' is currently '+temp.presence)
	while (temp.presence!=='active') {
		TAindex++
		TAindex%=helperIDs.length
		temp = rtm.dataStore.getUserById(helperIDs[TAindex])
		console.log(temp.real_name+' is currently '+temp.presence)
	}
	return temp
}
function messageTA(user,horizonite,message,helperIDs) {
	var dm = rtm.dataStore.getDMByName(user.name);
	console.log('********************** Sending message to:'+user.name+' **********************')
	console.log(dm)
	console.log('\n\n\n')
	var message = 'Hello ' + user.name + '! '+horizonite.real_name+' may need help with:\n'+
	'>'+message.text.slice(5)

	rtm.sendMessage(message, dm.id);
	TAindex++
	TAindex%=helperIDs.length
}
function getMessage() {
	var testMessages = [':squirrel: I sense a disturbance in the force...',
	':octocat: You must construct additional pylons',
	':bow_and_arrow: I used to code until I took an arrow to the knee',
	'The :cake: is a lie', ':confounded: + :robot_face: = :shit:',
	':basketball: Ball is life',':tractor: Ideal mode of transportation',
	':floppy_disc::neckbeard: I occasionally do computers', 
	':goberserk: All your base are belong to us']
	var index = Math.floor(Math.random()*31)%9
	return testMessages[index]
}

getMembers(function(helperIDs) {
	
	// you need to wait for the client to fully connect before you can send messages
	rtm.on(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, function () {
		// helpbot is activated & sends activation message
		rtm.sendMessage('Helpbot is ready to crush it!\n\
			Send your queries with the prefix ```?help```', api.chID, function messageSent() {
		// callback method based on response input
			rtm.on(RTM_EVENTS.MESSAGE, function (message) {
				// Listens to all 'message' events from the team
				console.log('\n\n\n')
				console.log(message)
				var horizonite = rtm.dataStore.getUserById(message.user)
				if ((!_.isUndefined(message.text)) && message.text.slice(0,5)==='?help') {
					if (message.text.slice(5).trim()==='') {
						rtm.sendMessage(horizonite.name+', you must specify your struggle in your help call.',
							api.chID, function messageSent() {})
					} else {
						console.log('**********************'+message.user+'**********************')
						console.log('**********************'+horizonite.name+'**********************')
						if (helperIDs.indexOf(message.user)===-1) {
							var user = getTAindex(helperIDs)
							messageTA(user,horizonite,message,helperIDs)
							rtm.sendMessage(horizonite.real_name+', help is on the way!\nLook for '+user.real_name,api.chID)
							console.log('\n\n')
						}
					}
				}
				console.log('\n\n\n')
				
			});
		});
	});
})
