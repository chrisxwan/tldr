var inTextBlock = false;
var level = Number.MAX_VALUE;
var textBlocks;
var index = -1;
$(html).each(function() {
	var currentLevel = $(this).parents.length;
	if(inTextBlock && currentLevel <= level) {
		inTextBlock = false;
	}
	if($(this).is('p') && !inTextBlock) {
		inTextBlock = true;
		level = $(this).parents().length - 1;
		var block = [ sentences: [], characters: 0 ];
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
for(i = 0; i < textBlocks.length; i+=) {
	if(textBlocks[i].characters > maxChars) {
		maxIndex = i;
		maxChars = textBlocks[i].characters;
	}
}
var article = textBlocks[maxIndex].sentences;