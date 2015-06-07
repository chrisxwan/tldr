var express = require('express');
var phantom = require('phantom');
var mongoose = require('mongoose');
var Article = mongoose.model('Article');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', {
        title: 'tl;dr'
    });
});

router.post('/', function(req, res) {
    var address = req.body.url;
    phantom.create(function(ph) {
        ph.createPage(function (page) {
            page.open(address, function(status) {
                if(status !== 'success') {
                    res.redirect('/error');
                }
                else {
                    page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {   
                        var sentences;
                        page.evaluate(function(){ 
                            var returnSentences = [];
                            $('p').each(function() {
                                var paragraph = $(this).text();
                                var period = paragraph.indexOf('.');
                                var sentence = paragraph.substring(0, period + 1);
                                returnSentences.push(sentence);
                            });
                            return returnSentences;
                        }, function(result) {
                            sentences = result;
                        });
                        var title;
                        page.evaluate(function() {
                            return $('title').text();
                        }, function(result) {
                            title = result;
                        });
                        var newArticle = new Article({
                            address: address,
                            title: title,
                            sentences: sentences
                        });
                        newArticle.save(function (err) {
                            if(err) {
                                res.send('There was a problem adding to the database.');
                            }
                        });
                        res.redirect('/' + title);
                        ph.exit();
                    });
                }
            });
        });
    });
});

router.get('/error', function(req, res){
    res.render('error');
})

router.get('/:title', function(req, res) {
    req.db.articles.findOne({'title': req.params.title}, function (error, article) {
        res.render('tldr', {
            address: article.address,
            title: article.title,
            sentences: article.sentences
        });
    });
});   



module.exports = router;