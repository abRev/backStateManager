var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var SubButton = new Schema({
	appId:{type:String},
	parentName:{type:String},
	type:{type:String},
	name:{type:String},
	key:{type:String},
	url:{type:String},
	media_id:{type:String}
});

mongoose.model('SubButton',SubButton);
