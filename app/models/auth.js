var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AuthSchema = new Schema({
	appID:{type:String,default:""},
	appSecret:{type:String},
	ticket:{type:String},
	ticketExpireTime:{type:Number},
	token:{type:String},
	tokenExpireTime:{type:Number}
});

mongoose.model('Auth',AuthSchema);
