(function ($) {
$(function () {
    if ($.browser.webkit && $.browser.version >= 533.16) {
       return;
    }
    $.each(['header', 'hgroup', 'article', 'footer'], function (i, element) {
	$(element).each(function () {
	    var c = $(this).attr('class');
	    var inside = $(this).html();
	    var div = $('<div></div>');
	    $(div).addClass(element).addClass(c).html(inside);
	    $(this).replaceWith(div);
	});
	
    });
});
})(jQuery);
