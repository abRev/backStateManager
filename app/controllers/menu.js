var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Article = mongoose.model('Article'),
	Button  = mongoose.model('Button'),
	SubButton = mongoose.model('SubButton');
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
		},
		{
			"name":"扫码子菜单",
			"sub_button":[
				{
					"type":"scancode_push",
					"name":"扫码推事件",
					"key":"scanPush"
				},
				{
					"type":"scancode_waitmsg",
					"name":"扫码带提示",
					"key":"scanMsg"
				}
			]
		}
	]
};
//截取这个地址
module.exports = function (app) {
  app.use('/wechat-back/menu/', router);
};

router.get('/index',function(req,res,next){
	res.render('menu/index',{
			title:"主页"
	});
});
//插入菜单
router.get('/insert/:num',function(req,res,next){
	if(req.params.num==1){
		Button.find({appId:jssdk.appId}).exec((err,buttons)=>{
			if(err) return next(err);
			if(buttons.length>=3){
				res.send('一级菜单已经达到最大值！！');
			}else{	
				res.render('menu/insertFirst',{
					title:'增加一级菜单'
				});
			}
		});
	}else{
		Button.find({appId:jssdk.appId}).exec((err,buttons)=>{
			if(err){
				return next(err);
			}
			if(buttons.length<0){
				res.send('没有一级菜单可用！');
			}else{
				SubButton.find({appId:jssdk.appId}).exec((err,subButtons)=>{
					if(err) return next(err);

					var parentNames=[];
					for(var button in buttons){
						if(buttons[button].sub_button==1){
							let count=0;
							for(var subIndex in subButtons){
								if(subButtons[subIndex].parentName === buttons[button].name){
									count++;
								}
							}
							if(count<7){
								console.log(buttons[button].name+' : '+count);
								parentNames.push(buttons[button].name);
							}
						}
					}
					if(parentNames.length == 0){
						res.send('没有支持二级菜单的一级菜单或所有二级菜单已满');
					}else{		
						res.render('menu/insertSecond',{
							title:'增加二级菜单',
							parentNames:parentNames
						});
					}	
				})
			}
		})
	}
});
//获取修改一级菜单界面
router.get('/edit',(req,res,next)=>{
	Button.find({appId:jssdk.appId}).exec((err,buttons)=>{
		if(err) return next(err);
		res.render('menu/edit/editOne',{
			title:'修改菜单',
			buttons:buttons
		})
	})
});

//获取一级菜单与对应的二级菜单页面并可以修改次一级菜单
router.get('/editOne/:_id',(req,res,next)=>{
	const Id = req.params._id;
	Button.findOne({appId:jssdk.appId,_id:Id}).exec((err,button)=>{
		if(err) return next(err);
		SubButton.find({appId:jssdk.appId,parentName:button.name}).exec((err,subButtons)=>{
			if(err) return next(err);
			res.render('menu/edit/editOneMore',{
				title:'查看一级菜单。。。',
				button:button,
				subButtons:subButtons
			})
		})
	})
});

//查看二级菜单
router.get('/editTwo/:_id',function(req,res,next){
	const Id = req.params._id;
	SubButton.findOne({_id:Id}).exec(function(err,subButton){
		if(err) return next(err);
		res.render('menu/edit/editTwo',{
			title:'修改二级菜单',
			subButton:subButton
		})
	})
});

//删除一级菜单
router.get('/delOne/:_id',(req,res,next)=>{
	const Id = req.params._id;
	Button.findOne({_id:Id}).exec((err,button)=>{
		if(err) return next(err);
		
		SubButton.find({appId:jssdk.appId,parentName:button.name}).exec((err,subButtons)=>{
			if(err) return next(err);
			console.log(subButtons.length+'  '+button.name);
			if(subButtons.length>0){		
				res.error('此一级菜单有二级菜单！ 请删除二级菜单后再做处理');
				res.redirect('back');
			}else{
				Button.remove({_id:Id}).exec((err)=>{
					if(err) return next(err);
					res.message('删除成功');
					res.redirect('back');
				})
			}
		});
	})
});

//删除二级菜单
router.get('/delTwo/:_id',(req,res,next)=>{
	const Id = req.params._id;
	SubButton.findOne({_id:Id}).exec((err,subBtn)=>{
		if(err) return next(err);
		if(subBtn){
			SubButton.remove({_id:Id}).exec((_err)=>{
				if(err) return next(_err);
				res.message('删除成功');
				res.redirect('back');
			})
		}
	});
});

//增加二级菜单
router.post('/insert/2',(req,res,next)=>{
	var subButton = new SubButton({
		appId:jssdk.appId,
		parentName:req.body.parentName,
		name:req.body.name,
		type:req.body.type,
		key:req.body.key,
		url:req.body.url,
		media_id:req.body.mediaId
	});
	subButton.save((err)=>{
		if(err) return next(err);
		res.send('提交成功');
	})
})
//增加一级菜单
router.post('/insert/1',function(req,res,next){
	Button.findOne({_id:req.body._id}).exec((err,button)=>{
		if(err) return next(err);
		if(button){
			Button.update({_id:req.body._id},{$set:
				{
					name:req.body.name,
					type:req.body.type,
					key:req.body.key,
					url:req.body.url,
					media_id:req.body.media_id,
					sub_button:req.body.sub_button
				}
			},(_err)=>{
				if(_err) return next(_err);
				res.send('修改成功');
			})
		}else{
			var button=new Button({
				appId:'wx0d3fe90f46946b2b',
				name:req.body.name,
				type:req.body.type,
				key:req.body.key,
				url:req.body.url,
				media_id:req.body.media_id,
				sub_button:req.body.sub_button
			});
			button.save((err)=>{
				if(err) return next(err);
				res.send('提交成功');
			});
		}
	})
})
//应用从数据库中获取的菜单
router.get('/:number', function (req, res, next) {
	var number = req.params.number;
	var menu;
	if(number == 1){
		menu = menuItems;
		createMenu(req,res,menu);
	}else if(number == 2){
		Button.find({appId:jssdk.appId}).exec(function(err,buttons){
			if(err){
				return next(err);
			}else{
				SubButton.find({appId:jssdk.appId}).exec(function(errSub,subButtons){
					if(errSub){
						return next(err);
					}else{	
						menu={
							"button":[
							]
						}
						for(index in buttons){
							let button={
								"name":buttons[index].name,
								"type":buttons[index].type,
								"key":buttons[index].key,
								"url":buttons[index].url,
								"media_id":buttons[index].media_id,
								"sub_button":[]
							};
							if(buttons[index].sub_button == 1){
								for(indexSub in subButtons){
									if(subButtons[indexSub].parentName == buttons[index].name){
										var sub={
											"type":subButtons[indexSub].type,
											"name":subButtons[indexSub].name,
											"key":subButtons[indexSub].key,
											"url":subButtons[indexSub].url,
											"media_id":subButtons[indexSub].media_id
										}
										button.sub_button.push(sub);
									}
								}
								
							}
							menu.button.push(button);
						}
						createMenu(req,res,menu,next);
					}
				});
			}
		});
	}
});
//调用微信公众号接口创建菜单
function createMenu(req,res,menu,next){
	console.log('menu=====>'+JSON.stringify(menu));
	jssdk.getAccessToken(function(err,token){
		if(err){
			console.log(err);
		}
		request.get('https://api.weixin.qq.com/cgi-bin/menu/delete?access_token='+token
		,function(errGet,resGet,body){
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
					if(resPost.body.errcode == 0){
						res.send('OK');
					}else{
						res.send(resPost.body);
					}
				}
			});
		});
	});
}
