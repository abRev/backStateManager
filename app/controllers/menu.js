var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Article = mongoose.model('Article');
var JSSDK = require('../../libs/jssdk.js');
var request = require('request');
var jssdk = new JSSDK('wx0d3fe90f46946b2b','8d8cd2ec36fa750cfdf7566e850ba03c');


const menuItems = {
	"button":[
		{
			"type":"click",
			"name":"哈哈test",
			"key":"conversation-history"
		},
		{
			"type":"view",
			"name":"随机问答",
			"url":"http://demo.open.weixin.qq.com/jssdk"
		}
	]
};
const menuItems2 = {
	"button":[
		{
			"type":"click",
			"name":"问答历史",
			"key":"conversation-history"
		},
		{
			"type":"view",
			"name":"随机问答",
			"url":"http://www.fullab.top/wechat/random"
		}
	]
};

module.exports = function (app) {
  app.use('/wechat-back', router);
};

router.get('/test/:number', function (req, res, next) {
	var number = req.params.number;
	var menu;
	if(number == 1){
		menu = menuItems;
	}else if(number == 2){
		menu = menuItems2;
	}
	jssdk.getAccessToken(function(err,token){
		if(err){
			console.log(err);
		}
		request.get('https://api.weixin.qq.com/cgi-bin/menu/delete?access_token='+token,function(errGet,resGet,body){
			if(errGet){
				console.log(errGet);
				return next(errGet);
			}
			
			request.post({
				url:"https://api.weixin.qq.com/cgi-bin/menu/create?access_token="+token,
				json:menu
			},function(errPost,resPost,bodyPost){
				if(errPost){
					console.log(errPost);
					return next(errPost);
				}else{
					res.end('OK');
				}
			});
		});
	});
});
