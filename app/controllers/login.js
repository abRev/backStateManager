var express = require('express');
var User = require('../../libs/user');
var router = express.Router();

module.exports = function(app){
	app.use('/wechat-back/login/',router);
};


router.get('/',(req,res,next)=>{
	res.send('ok');
})
