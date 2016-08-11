var mongoose =require('mongoose');
var Schema = mongoose.Schema;

var ButtonSchema = new Schema({
	appId:{type:String},
	name:{type:String},
	type:{type:String,default:"click"},
	key:{type:String},
	url:{type:String},
	media_id:{type:String},
	sub_button:{type:Number,default:0}
});

mongoose.model('Button',ButtonSchema);
