var Models = window.Models || {};

Models.Block = function(fields, w, h, _x, _y) {
    this.width = w;
    this.height = h;
    this.x = _x;
    this.y = _y;
    this.template = 'horizontal';
    this.element;
    this.fields = fields;

    this.units = function() {
        units = [];
        for (var i = 0; i <= this.height - 1; i++) {
            for (var j = 0; j <= this.width - 1; j++) {
                units.push({ x: this.x + j, y: this.y + i });
            }
        }
        return units;
    }

    this.overlapsAny = function(block) {
        var this_units = this.units();
        var other_units = block.units();

        for (var i = 0; i < this_units.length; i++) {
            for (var j = 0; j < other_units.length; j++) {
                if ( _.isEqual(this_units[i], other_units[j])) { return true; }
            }
        }
        return false;
    }

    this.overlappedFullyBy = function(blocks) {
        var otherUnits = this.getUnitsFromBlocks(blocks);
        var myUnits = this.units().slice();

        // return true if each of my units
        // matches at least one of the units argued
        return _.all(myUnits, function(myUnit) {
            return _.any(otherUnits, function(otherUnit) {
                return myUnit.x == otherUnit.x && myUnit.y == otherUnit.y;
            })
        })
    }

    this.setPosition = function(x, y) {
        if (!_.isUndefined(x) && !_.isUndefined(y)) {
            this.x = x;
            this.y = y;
        }
        return this;
    }

    this.sizeClassName = function() {
        return "s" + this.width + "x" + this.height;
    }

    this.positionClassName = function() {
        return "p" + this.x + "x" + this.y;
    }

    this.render = function() {
        if (_(this.element).isUndefined()) {
            this.element = $(document.createElement('div'))
            .addClass('block')
            .addClass(this.sizeClassName())
            .addClass(this.positionClassName())
            .attr('data-template', this.template)
            .css({
                "top": (this.y * 250) + "px",
                "left": (this.x * 250) + "px"
            });

            if (this.fields) {
                var textContainer = $('<div class="text-container">');
                
                textContainer
                    .append('<textarea placeholder="Title" id="' + this.x +'x' + this.y + 'title" name="' + this.x +'x' + this.y + 'title" class="title"></textarea>')
                    .append('<textarea placeholder="Subtitle" id="' + this.x +'x' + this.y + 'subtitle" name="' + this.x +'x' + this.y + 'subtitle" class="subtitle"></textarea>');

                if (this.template == 'vertical-2') {
                    textContainer.css('background', background);
                }
                if (this.template != 'middle-text') {  
                    this.element
                        // .append('<input type="file" id="' + this.x +'x' + this.y + 'file" name="' + this.x +'x' + this.y + 'file" class="file" />')
                        .append('<img src="img/templates/' + this.template + '.jpg" id="' + this.x +'x' + this.y + 'image" name="' + this.x +'x' + this.y + 'image" class="image" />');
                }

                this.element
                    .append(textContainer);

                textContainer.find('textarea').TextAreaExpander(0, 240);
            }
        }

        return this.element;
    }

    this.destroy = function() {
        if (!_(this.element).isUndefined()) {
            this.element.remove();
        }
    }

    this.getUnitsFromBlocks = function(blocks) {
        if (!_.isArray(blocks)) {
            return blocks.units()
        }

        return _.reduce(blocks, function(memo, block) {
            return memo.concat(block.units());
        }, []);
    }

    this.positionFromElement = function(classes) {
        if (_.isUndefined(classes)) {
            classes = this.render().attr('class')
        }

        var positionClass = _.detect(classes.split(" ")
            , function(clss) {
                return /^p\d/.test(clss);
            });

        var position = {
            x: parseInt( positionClass.match(/(?:^p)(.)(?:x)/)[1] ),
            y: parseInt( positionClass.match(/x(.)$/)[1] )
        }

        return position;
    }

    this.sizeFromElement = function(classes) {
        if (_.isUndefined(classes)) {
            classes = this.render().attr('class')
        }

        var sizeClass = _.detect(classes.split(" ")
            , function(clss) {
                return /^s\d/.test(clss);
            });

        var size = {
            width: parseInt( sizeClass.match(/(?:^s)(.)(?:x)/)[1] ),
            height: parseInt( sizeClass.match(/x(.)$/)[1] )
        }

        return size;
    }
};