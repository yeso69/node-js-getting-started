
var rq = require('request-promise');
var config = require('./config.js');

var options = function(path){
    return{
        uri: config.API_URL+path,
        headers: {
            'User-Agent': config.APP_NAME
        },
        json: true
    }
}

module.exports = function(app){

    app.get('/login', (req, res) => {
       res.redirect(config.AUTH_URL+"authorize?client_id="+config.CLIENT_ID+"&scope=public_repo");
    });

    app.get('/callback', (req, res) => {
        console.log(req.query);
        var option = options("");
        option["uri"] = config.AUTH_URL + "access_token?client_id="+config.CLIENT_ID+"&client_secret="+config.CLIENT_SECRET+"&code="+req.query.code;
        rq.post(option)
            .then((body) => {
                console.log(body);
                res.cookie(config.APP_NAME, body.access_token);
                res.redirect('/');
            });
    });

    app.get('/logout', (req, res) => {
       res.clearCookie(config.APP_NAME);
       res.redirect('/');
    });

    app
        .get('/star', (req, res, next) => {
            if(req.cookies[config.APP_NAME]){
                next();
            }else{
                res.status(401);
                res.send("You need to be authenticated !");
            }
        })
        .get('/star', (req, res) => {
            var option = options("user/starred/"+req.query.repo);
            option.headers["Authorization"] = "token "+req.cookies[config.APP_NAME];
            console.log(option);
            rq.put(option)
                .then(()=>{
                   res.send("OK");
                })
                .catch(()=>{
                   res.status(400);
                   res.send("Failed");
                });
        });

    app.get('/', (req, res) => {
        var option = options("search/repositories?q=stars:>1000&sort=stars&order=desc&per_page=100&page=1");
        //console.log(option);
        rq.get(option)
            .then((body) => {
                var logged = req.cookies[config.APP_NAME] ? true : false;
                res.render('pages/index', { results: body.items, logged: logged });
            });
    });

}