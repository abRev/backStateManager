var express = require('express');
var User = require('../../libs/userRedis');
var router = express.Router();

module.exports = function(app){
	app.use('/wechat-back/login/',router);
};


router.get('/',(req,res,next)=>{
	res.render('login/login',{
		title:'登陆'
	});
});

router.post('/',(req,res,next)=>{
	var data = req.body.user;
	User.authenticate(data.name,data.pass,function(err,user){
		if(err) return next(err);
		if(user){
			req.session.uid = user.id;
			res.redirect('/wechat-back/menu');
		}else{
			res.error('登陆失败！');
			res.redirect('back');
		}
	});
});

router.get('/logout',(req,res)=>{
	req.session.destroy((err)=>{
		if(err) throw err;
		res.redirect('/wechat-back/login');
	})
})

router.get('/register',function(req,res,next){
	res.render('login/register',{
		title:'注册',
	});
});

router.post('/register',(req,res,next)=>{
	var data = req.body.user;
	User.getByName(data.name,function(err,user){
		if(err) return next(err);
		if(user.id){
			res.error('用户名被占用');
			res.redirect('back');
		}else{
			user = new User({
				name:data.name,
				pass:data.pass
			});
			user.save((err)=>{
				if(err) return next(err);
				req.session.uid = user.id;
				res.message('注册成功');
				res.redirect('/wechat-back/menu')
			})
		}
	})
})
