var crypto = require('crypto');
var fs = require('fs');
var request = require('request');
var mongoose = require('mongoose');
var Auth = mongoose.model('Auth');


function JSSDK(appId,appSecret){
	this.appId= appId;
	this.appSecret=appSecret;
}



JSSDK.prototype={
	getSignPackage:function(url){
		this.getJsApiTicket(function(err,jsapiTicket){
			var timestamp = Math.round(Date.now()/1000);
			var nonceStr = this.createNonceStr();
		
	
			var rowString = "jsapi_ticket="+jsapiTicket+"&noncestr="+nonceStr+"&timestamp="+timestamp+"&url="+url;
			var hash = crypto.createHash('sha1');
			var	sign = hash.update(rowString).digest('hex');

			return {
				appId:this.appId,
				nonceStr:nonceStr,
				timestamp:timestamp,
				url:url,
				signature:sign,
				rowString:rowString
			};
		});
	},
	getJsApiTicket:function(done){
		var instance = this;
		this.readCacheDatabase(this.appId,this.appSecret,function(err,auth){
			if(err){
				return done(err,null);
			}else{
				var time = Math.round(Date.now()/1000);
				if(auth.ticketExpireTime < time){
					instance.getAccessToken(function(error,token){
						if(error){
							return done(error,null);
						}
						
						var url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token="+token;
						request.get(url,function(err,res,body){
							if(err){
								return done(err,null);
							}
		
							try{
								var data = JSON.parse(body);
								auth.ticketExpireTime=Math.round(Date.now()/1000 + 7200);
								auth.ticket = data.ticket;
								auth.save(function(err){
									if(err){
										done(err,null);
									}else{
										done(null,data.ticket);
									}
								});
							}catch(e){
								return done(e,null);
							}
						});
					});
				}else{
					done(null,auth.ticket);
				}
			}	
		});
	},
	getAccessToken:function(done){
		var instance = this;
		var auth = this.readCacheDatabase(this.appId,this.appSecret,function(err,auth){
			if(err){
				done(err,null);
			}else{
				var time = Math.round(Date.now()/1000);
				if(auth.tokenExpireTime<time){
					var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+instance.appId+"&secret="+instance.appSecret;
					request.get(url,function(err,res,body){
						if(err){
							return done(err,null);
						}
						try{
							var data = JSON.parse(body);
							auth.tokenExpireTime = Math.round(Date.now()/1000 +7200);
							auth.token = data.access_token;
							auth.save(function(err){
								if(err){
									done(err,null);
								}else{
									done(null,data.access_token);
								}
							})
						}catch(err){
							return done(err,null);
						}
					});
				}else{
					done(null,auth.token);	
				}
			}
		});
		
	},
	createNonceStr:function(){
		var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var length = chars.length;
		var str="";
		for (let i=0;i<16;i++){
			str+= chars.substr(Math.round(Math.random()*length),1);
		}
		return str;
	},
	readCacheFile:function(filename){
		try{
			var data = fs.readFileSync(filename);
			return JSON.parse(data);
		}catch(e){
			console.log(filename+'  '+e);
		}
		return {};
	},
	writeCacheFile:function(filename,data){
		return fs.writeFileSync(filename,JSON.stringify(data));
	},
	readCacheDatabase:function(appID,appSecret,done){
		Auth.findOne({appID:appID},function(err,auth){
			if(err){
				return done(err,null);
			}
			if(auth){
				return done(null,auth);
			}else{
				var authNew = new Auth({
					appSecret:appSecret,
					ticketExpireTime:0,
					ticket:"",
					token:"",
					tokenExpireTime:0,
					appID:appID
				});
				authNew.save(function(err,_auth){
					if(err) {
						return done(err,null);
					}else{
						return done(null,_auth);
					}
				});
			}
		});
	}
};

module.exports = JSSDK;
