var express = require('express');
var phantom = require('phantom');
var page = require('webpage').create(),
    system = require('system'),
    address;
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', {
        title: 'tl;dr'
    });
});

router.post('/', function(req, res) {
    var address = req.body.url;
    var tldr = function() {
        var sentences = [];
        $('p').each(function() {
            var paragraph = $(this).text();
            var period = paragraph.indexOf('.');
            var sentence = paragraph.substring(0, period + 1);
            sentences.push(sentence);
        });
        return sentences;
    }
    page.open(address, function(status) {
        if(status !== 'success') {
            res.render('/error', {
                address: address
            });
            phantom.exit();
        }
        else {
            page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {   
                var returnSentences = page.evaluate(function() {
                    return tldr();
                });
                res.render('/' + address, {
                    sentences: returnSentences;
                });
            });
        }
    });
})


module.exports = router;