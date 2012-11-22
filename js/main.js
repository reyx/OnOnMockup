var prevBlock, background = '#0093D0';

$(function() {
	$(window).resize(function() {
		resizeWidget();
	});

	resizeWidget();

	$('#workingArea').mousewheel(function(event, delta) {
		this.scrollLeft -= (delta * 30);
		event.preventDefault();
	});

	window.placeholderGrid = new Models.Grid(10, 2, $('#placeholderGrid'));
	_.times(20, function() {
		placeholderGrid.add(new Models.Block(false, 1, 1))
	});

	window.grid = new Models.Grid(10, 2, $('#workingGrid'));

	$('.key').draggable({ helper: renderDragHelper }).bind('touchend', keyTouchHandler);

	$('#placeholderGrid .block').droppable({
		over: overGridHandler,
		drop: dropGridHandler,
		tolerance: "pointer"
	});

	$('#workingGrid').droppable({
		out: outGridHandler,
		tolerance: "pointer"
	}).on("contextmenu", function(e) {
	   	return false;
	});

	$('.color-selector button').css('background', background);

	$('#btn-remove').on('click', function(){
		$('#workingGrid .selected').each(function(block) {
			var tmp = generateBlock($(this), $(this));
			grid.remove(tmp.x, tmp.y);
			$(this).remove();
		});

		toggleAppBar();
	});

	$('.color-selector button').on('click',function() {
		$('.color-selector ul').toggle();
	});

	$('#txt-templates').on('click', function() {
		if ($('#keys').width() == 0) {
			$('#keys').show().width(375);
			$('#workingArea').css('margin-left', '80px');
			resizeWidget($(window).width() - $('#keys').width() - 246);
		} else {
			$('#keys').hide().width(0);
			$('#workingArea').css('margin-left', '0');
			resizeWidget($(window).width() - $('#keys').width() - 166);
		}
	});

	$('.color-selector ul li a').on('click', function() {
		$('.color-selector ul').toggle();
		background = $(this).css('background');
		$('.key, .key .text, #workingGrid .block, .color-selector button, #workingGrid [data-template="vertical-2"] .text-container').css('background', background);
		$('#txt-section').css('color', background);
	});
});

var resizeWidget = function(w) {
	if (w)
		$('#workingArea').width(w);
	else
		$('#workingArea').width($(window).width() - $('#keys').width() - 246);
}

var renderDragHelper = function() {
	var sizeHash = new Models.Block(false).sizeFromElement($(this).attr('class'));
	var sizeClass = 's' + sizeHash.width + 'x' + sizeHash.height;
	var helper = $('<li class="key dragging ' + sizeClass + '"></li>').attr('data-template', $(this).attr('data-template'));

	return helper;
}

var overGridHandler = function(event, ui) {

	// scale key up to grid size
	if (ui.helper.hasClass('key')){
		ui.helper.removeClass('key').addClass('block');
	}

	// add class to style according to wether piece fits or not
	$('#placeholderGrid').removeClass('canFit');
	$('#placeholderGrid').removeClass('cantFit');

	if (grid.canFit(generateBlock(ui.helper, $(this)))){
		$('#placeholderGrid').addClass('canFit');
	} else {
		$('#placeholderGrid').addClass('cantFit');
	}

	showFitWhileDragging(ui.helper, $(this));
}

var outGridHandler = function() {
  	clearFit();
}

var showFitWhileDragging = function(helper, unit) {
	var overlapped = placeholderGrid.blocksOverlappedByBlock(generateBlock(helper, unit) );

	$('#placeholderGrid .block').removeClass('draggingOver');

	_(overlapped).each(function(block) {
		block.element.addClass('draggingOver');
	});
}

var clearFit = function() {
	$('.dragging.block').removeClass('block').addClass('key');
	$('.draggingOver').removeClass('draggingOver');
}

var dropGridHandler = function(event, ui) {
	var success = grid.place(generateBlock(ui.helper, $(this)));
	clearFit();
	$('#workingGrid .block:not(".ui-draggable")')
		.draggable({
			//helper: renderDragHelper,
			cursorAt: { 
				left: 20,
				top: 20
			},
			containment: 'parent',
			start: function(e, u) {
				$(this).data("origPosition", $(this).position());
				prevBlock = generateBlock(u.helper, $(this));
			}
		})
		.css("background", background)
		.on("contextmenu", function(e) {
			$(this).toggleClass('selected');
			toggleAppBar();
		   	return false;
		});

	if (success) {
		$(ui.helper).remove();
		if (prevBlock) {
			grid.remove(prevBlock.x, prevBlock.y);
			prevBlock = null;
		}
	}
	else {
		ui.draggable.animate(ui.draggable.data().origPosition, "fast");
	}

	toggleAppBar();
}

var toggleAppBar = function() {
	if ($('#workingGrid .block.selected').length > 0 && $("#appBar").is(':hidden')) {
		$("#appBar").show();
	} else if ($('#workingGrid .block.selected').length == 0 && $("#appBar").is(':visible')) {
		$("#appBar").hide();
	}
}

var keyTouchHandler = function(event) {
	var block = new Models.Block(false);
	var size = block.sizeFromElement($(this).attr('class'));

	block.width = size.width;
	block.height = size.height;

	grid.add( block );

	if (grid.isComplete()) {
		enableShowCode();
	}
}

var generateBlock = function(draggedBlock, unit) {
	var block = new Models.Block(true);
	var size = block.sizeFromElement(draggedBlock.attr('class'))
	var position = block.positionFromElement(unit.attr('class'));

	block.width = size.width;
	block.height = size.height;
	block.x = position.x;
	block.y = position.y;
	block.template = draggedBlock.attr('data-template');

	return block;
}

var revertDraggable = function revertDraggable($selector) {
    $selector.each(function() {
        var $this = $(this),
            position = $this.data("originalPosition");

        if (position) {
            $this.animate({
                left: position.left,
                top: position.top
            }, 500, function() {
                $this.data("originalPosition", null);
            });
        }
    });
}