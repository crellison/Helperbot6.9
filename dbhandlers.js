var mongoose = require('mongoose')
var api = require('./config')
mongoose.connect(require(api.mongo))
var Schema = mongoose.Schema;

var Student = mongoose.model('Student',{
	name: {
		type: String,
		required: true,
	},
	queries: [],
})

var ta = mongoose.model('TA',{
	name: {
		type: String,
		required: true,
	},
	queries: [],
})

var query = new Schema({
	ta: String,
	student: String,
	time: Number,
	type: String, // css,html,js,data,other
})