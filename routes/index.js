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
    res.redirect('/' + address);
});

router.get('/:address', function(req, res) {
    var tldr = function() {
        page.evaluate(function() {
            var sentences = [];
            $('p').each(function() {
                var paragraph = $(this).text();
                var period = paragraph.indexOf('.');
                var sentence = paragraph.substring(0, period + 1);
                sentences.push(sentence);
            });
            var title = $('title').text();
            window.callPhantom({
                sentences: sentences,
                title: title
            });
        });
        ph.exit();
    }

    page.onCallback = function(data) {
        res.render('tldr', {
            sentences: data.sentences,
            title: data.title
        });
    }
    phantom.create(function(ph) {
        ph.createPage(function (page) {
            page.open(address, function(status) {
                if(status !== 'success') {
                    res.render('error1', {
                        address: req.params.address
                    });
                    ph.exit();
                }
                else {
                    page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {   
                        tldr();
                    });
                }
            });
        });
    });     
});


module.exports = router;