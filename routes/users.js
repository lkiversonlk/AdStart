var express = require('express');
var router = express.Router();
var winston = require("winston");

/**
 * get user self infomation
 */
router.get('/', function(req, res, next) {
  /**
   * first get oauth info
   */
  var oauth = req.app.get("wechat-oauth");
  var url = oauth.getAuthorizeURL( req.protocol + "://" + req.get('host') + req.baseUrl + "/mine", "testState", "snsapi_userinfo");
  res.redirect(url);
});


router.get("/:user_id", function(req, res, next){
  var dao = req.app.get("dao");

  if(req.params.user_id == 'mine'){
    var code = req.query.code;
    var oauth = req.app.get("wechat-oauth");
    oauth.getAccessToken(code, function(err, result){
      if(err){
        winston.log("error", "fail to get oauth access token ", err);
      }else{
        var accessToken = result.data.access_token;
        var openid = result.data.openid;
        oauth.getUser(openid, function(err, result){
          if(err){
            res.end("sorry, we can't get your infomation");
          }else{
            var user_id = result.openid;
            var delegations = dao.loadDelegations(user_id);
            var data = {
              user : {
                name : result.nickname,
                iconUrl : result.headimgurl + "96"
              },
              delegations : delegations
            };

            res.render("users/user", data);
          }
        });
      }
    });
  }else{
    res.end();
  }
});


router.get("/mine", function(req, res, next){
  var code = req.query.code;
  res.write("code : " + code);
  var oauth = req.app.get("wechat-oauth");
  oauth.getAccessToken(code, function(err, result){
    var accessToken = result.data.access_token;
    res.write("access_token: " + accessToken);
    var openid = result.data.openid;
    res.write("openid: " + openid);

    oauth.getUser(openid, function(err, result){
      res.write(JSON.stringify(result));
    });
  });
  res.end();
});

module.exports = router;
