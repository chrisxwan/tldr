var express = require('express');
var async = require('async');
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
                    console.log('error');
                    res.redirect('/error');
                }
                else {
                    page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js", function() {  
                        req.db.articles.findOne({'address': address}, function (error, article) {
                            if(!error && article) {
                                res.redirect('/article' + article._id);
                            } else {
                                async.waterfall([
                                    function (callback) {
                                        page.evaluate(function(){
                                            var abbreviations = ['Mr.', 'Sr.', 'Ms.', 'Jr.', 'Prof.', 'Gen.', 'Rep.', 'Sen.', 'Mrs.',
                                                                 'Ph.D.', 'M.D.', 'B.A.', 'M.A.', 'in.', 'ft.', 'F.B.I.',
                                                                 'a.m.', 'p.m.', 'U.S.', 'etc.', 'i.e.', 'al.', 'e.g.', 
                                                                 'B.C.', 'A.D.', 'C.E.', 'A.M.', 'P.M.', 'D.C.', 'Lt.', 'Col.'];
                                            var nth_occurrence = function (string, char, nth) {
                                                var first_index = string.indexOf(char);
                                                var length_up_to_first_index = first_index + 1;

                                                if (nth == 1) {
                                                    return first_index;
                                                } else {
                                                    var string_after_first_occurrence = string.slice(length_up_to_first_index);
                                                    var next_occurrence = nth_occurrence(string_after_first_occurrence, char, nth - 1);

                                                    if (next_occurrence === -1) {
                                                        return -1;
                                                    } else {
                                                        return length_up_to_first_index + next_occurrence;  
                                                    }
                                                }
                                            };
                                            var inTextBlock = false;
                                            var level = Number.MAX_VALUE;
                                            var textBlocks = [];
                                            var index = -1;
                                            $('html').each(function() {
                                                console.log('hi');
                                                var currentLevel = $(this).parents().length;
                                                if(inTextBlock && currentLevel <= level) {
                                                    inTextBlock = false;
                                                }
                                                if($(this).is('p') && !inTextBlock) {
                                                    inTextBlock = true;
                                                    level = $(this).parents().length - 1;
                                                    var block = { sentences: [], characters: 0 };
                                                    index++;
                                                    textBlocks.push(block);
                                                }
                                                if($(this).is('p') && inTextBlock) {
                                                    var paragraphLength = $(this).text().length;
                                                    textBlocks[index].characters += paragraphLength;
                                                    textBlocks[index].sentences.push($(this).text());
                                                }
                                            });
                                            var maxIndex = -1;
                                            var maxChars = Number.MIN_VALUE;
                                            for(i = 0; i < textBlocks.length; i++) {
                                                if(textBlocks[i].characters > maxChars) {
                                                    maxIndex = i;
                                                    maxChars = textBlocks[i].characters;
                                                }
                                            }
                                            var article = textBlocks[maxIndex].sentences;
                                            for(i=0; i < article.length; i++) {
                                                var nth = 1;
                                                var paragraph = article[i];
                                                var period = nth_occurrence(paragraph, '.', nth);
                                                var parse = paragraph.substring(period-4, period+3);
                                                if(i === article.length - 1) {
                                                    returnSentences.push(paragraph);
                                                } else {
                                                    for(j = 0; j < abbreviations.length; j++) {
                                                        if(parse.indexOf(abbreviations[j]) >= 0) {
                                                            nth++;
                                                            period = nth_occurrence(paragraph, '.', nth);
                                                            j=0;
                                                            var parse = paragraph.substring(period-4, period+3);
                                                        }
                                                    }
                                                }
                                                var sentence = paragraph.substring(0, period + 1);
                                                returnSentences.push(sentence);
                                            }
                                            return returnSentences;
                                        }, function (result) {
                                            sentences = result;
                                            callback(null, sentences);
                                        });
                                    },
                                    function (sentences, callback) {
                                        var title;
                                        page.evaluate(function() {
                                            return $('title').text();
                                        }, function (result) {
                                            title = result;
                                            callback(null, sentences, title);
                                        }); 
                                        
                                    },
                                    function (sentences, title, callback) {
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
                                        res.redirect('/article' + newArticle._id);
                                        ph.exit();    
                                        callback(null, 'done');                       
                                    }
                                ], 
                                function (err, results) {
                                    if (err) { console.log(err); }
                                });        
                            }
                        }); 
                    });
                }
            });
        });
    });
});

router.get('/error', function(req, res){
    res.render('error');
})

router.get('/article:id', function(req, res) {
    Article.findById(req.params.id, function (error, article) {
        res.render('tldr', {
            title: article.title,
            address: article.address,
            articleTitle: article.title,
            sentences: article.sentences
        });
    });
});   



module.exports = router;