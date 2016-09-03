/* global window alert jQuery gj */
/*
 * Gijgo JavaScript Library v1.0.0
 * http://gijgo.com/
 *
 * Copyright 2014, 2016 gijgo.com
 * Released under the MIT license
 */
/**
    gj = {};
}
if (typeof(gj.tree) === 'undefined') {
    gj.tree = {
        plugins: {}
    };
}

gj.tree.config = {
    base: {

        /** When this setting is enabled the content of the tree will be loaded automatically after the creation of the tree.

        /** The type of the node selection.<br/>
         * If the type is set to multiple the user will be able to select more then one node in the tree.

        /** This setting enable cascade selection and unselection of children

        /** The data source of tree.

        primaryKey: undefined,
        textField: 'text',
        childrenField: 'children',

        /** Width of the tree.

        /** The name of the UI library that is going to be in use.

        autoGenId: 1,

        style: {
            wrapper: 'gj-tree-unselectable',
            list: 'gj-tree-list',
            item: 'gj-tree-item',
            active: 'gj-tree-base-active',
            leftSpacer: undefined,
            expander: 'gj-tree-expander',
            display: 'gj-tree-display',
            expandIcon: undefined,
            collapseIcon: undefined,
            leafIcon: undefined
        }
    },

    bootstrap: {
        style: {
            wrapper: 'gj-tree-unselectable',
            list: 'gj-bootstrap-tree-list list-group',
            item: 'gj-bootstrap-tree-item list-group-item',
            active: 'active',
            leftSpacer: 'gj-tree-bootstrap-left-spacer',
            expander: 'gj-tree-bootstrap-expander glyphicon',
            display: 'gj-tree-bootstrap-display',
            expandIcon: 'glyphicon-plus',
            collapseIcon: 'glyphicon-minus',
            leafIcon: undefined
        }
    },

    jqueryui: {}
};
/**
    /**
     * Event fires when the tree is initialized
        $tree.triggerHandler('initialized');
    },

    /**
     * Event fired before data binding takes place.
        $tree.triggerHandler('dataBinding');
    },

    /**
     * Event fires after the loading of the data in the grid.
        $tree.triggerHandler('dataBound');
    },

    /**
     * Event fires after selection of tree node.
        return $tree.triggerHandler('select', [$node, id, record]);
    },

    /**
     * Event fires on un selection of tree node
        return $tree.triggerHandler('unselect', [$node, id, record]);
    },

    /**
     * Event fires before node expand.
        return $tree.triggerHandler('expand', [$node, id, record]);
    },

    /**
     * Event fires before node collapse.
        return $tree.triggerHandler('collapse', [$node, id, record]);
    },

    /**
     * Event fires 
        return $tree.triggerHandler('destroying');
    }
}
/*global gj $*/
gj.tree.methods = {

    init: function (jsConfig) {
        gj.widget.prototype.init.call(this, jsConfig, 'tree');

        gj.tree.methods.initialize.call(this);

        if (this.data('autoLoad')) {
            this.reload();
        }
        return this;
    },

    initialize: function () {
        var data = this.data(),
            $root = $('<ul class="' + data.style.list + '"/>');
        this.empty().addClass(data.style.wrapper).append($root);
        if (data.width) {
            this.width(data.width);
        }
        gj.tree.events.initialized(this);
    },

    render: function ($tree, response) {
        if (response) {
            if (typeof (response) === 'string' && JSON) {
                response = JSON.parse(response);
            }
            $tree.data('records', response);
            gj.tree.methods.loadData($tree);
        }
        return $tree;
    },

    loadData: function ($tree) {
        var i,
            records = $tree.data('records'),
            $root = $tree.children('ul');

        gj.tree.events.dataBinding($tree);
        $root.off().empty();
        for (i = 0; i < records.length; i++) {
            gj.tree.methods.appendNode($tree, $root, records[i], 1);
        }
        gj.tree.events.dataBound($tree);
    },

    appendNode: function ($tree, $parent, nodeData, level, position) {
        var i, $node, $newParent,
            data = $tree.data(),
            id = data.primaryKey ? nodeData[data.primaryKey] : data.autoGenId++,
            $node = $('<li data-id="' + id + '"/>').addClass(data.style.item),
            $expander = $('<span data-role="expander" data-mode="close"></span>'),
            $display = $('<span data-role="display">' + nodeData[data.textField] + '</span>');

        if (data.style.leftSpacer) {
            if (!level) {
                level = $parent.parents('ul').length + 1;
            }
            for (i = 1; i < level; i++) {
                $node.append('<span data-role="spacer" class="' + data.style.leftSpacer + '"></span>');
            }
        }

        $expander.addClass(data.style.expander).on('click', gj.tree.methods.expanderClickHandler($tree));
        $node.append($expander);

        $display.addClass(data.style.display).on('click', gj.tree.methods.displayClickHandler($tree));
        $node.append($display);

        if (nodeData[data.childrenField] && nodeData[data.childrenField].length) {
            data.style.expandIcon ? $expander.addClass(data.style.expandIcon) : $expander.text('+');
            $newParent = $('<ul />').addClass(data.style.list).addClass('gj-hidden');
            $node.append($newParent);
            
            for (i = 0; i < nodeData[data.childrenField].length; i++) {
                gj.tree.methods.appendNode($tree, $newParent, nodeData[data.childrenField][i], level + 1);
            }  
        } else {
            data.style.leafIcon ? $expander.addClass(data.style.leafIcon) : $expander.html('&nbsp;');
        }

        if (position) {
            $parent.find('li:eq(' + (position - 1) + ')').before($node);
        } else {
            $parent.append($node);
        }
    },

    expanderClickHandler: function ($tree) {
        return function (e) {
            var $expander = $(this),
                $node = $expander.parent('li');
            if ($expander.attr('data-mode') === 'close') {
                $tree.expand($node);
            } else {
                $tree.collapse($node);
            }
        }
    },

    expand: function ($tree, $node, cascade) {
        var $children, i,
            $expander = $node.children('[data-role="expander"]'),
            data = $tree.data(),
            id = $node.attr('data-id'),
            $list = $node.children('ul');
        if ($list && $list.length) {
            if (gj.tree.events.expand($tree, $node, id) !== false) {
                $list.show();
                $expander.attr('data-mode', 'open');
                data.style.collapseIcon ? $expander.removeClass(data.style.expandIcon).addClass(data.style.collapseIcon) : $expander.text('-');
                if (cascade) {
                    $children = $node.find('ul>li');
                    for (i = 0; i < $children.length; i++) {
                        gj.tree.methods.expand($tree, $($children[i]), cascade);
                    }
                }
            }
        }
        return $tree;
    },

    collapse: function ($tree, $node, cascade) {
        var $children, i,
            $expander = $node.children('[data-role="expander"]'),
            data = $tree.data(),
            id = $node.attr('data-id'),
            $list = $node.children('ul');
        if ($list && $list.length) {
            if (gj.tree.events.collapse($tree, $node, id) !== false) {
                $list.hide();
                $expander.attr('data-mode', 'close');
                data.style.expandIcon ? $expander.removeClass(data.style.collapseIcon).addClass(data.style.expandIcon) : $expander.text('+');
                if (cascade) {
                    $children = $node.find('ul>li');
                    for (i = 0; i < $children.length; i++) {
                        gj.tree.methods.collapse($tree, $($children[i]), cascade);
                    }
                }
            }
        }
        return $tree;
    },

    expandAll: function ($tree) {
        var i, $nodes = $tree.find('ul>li');
        for (i = 0; i < $nodes.length; i++) {
            gj.tree.methods.expand($tree, $($nodes[i]), true);
        }
        return $tree;
    },

    collapseAll: function ($tree) {
        var i, $nodes = $tree.find('ul>li');
        for (i = 0; i < $nodes.length; i++) {
            gj.tree.methods.collapse($tree, $($nodes[i]), true);
        }
        return $tree;
    },

    displayClickHandler: function ($tree) {
        return function (e) {
            var $display = $(this),
                $node = $display.parent('li'),
                cascade = $tree.data().cascadeSelection;
            if ($node.attr('data-selected') === 'true') {
                gj.tree.methods.unselect($tree, $node, cascade);
            } else {
                if ($tree.data('selectionType') === 'single') {
                    gj.tree.methods.unselectAll($tree);
                }
                gj.tree.methods.select($tree, $node, cascade);
            }
        }
    },

    selectAll: function ($tree) {
        var i, $nodes = $tree.find('ul>li');
        for (i = 0; i < $nodes.length; i++) {
            gj.tree.methods.select($tree, $($nodes[i]), true);
        }
        return $tree;
    },

    select: function ($tree, $node, cascade) {
        var i, $children, data = $tree.data();
        if ($node.attr('data-selected') !== 'true' && gj.tree.events.select($tree, $node) !== false) {
            $node.addClass(data.style.active).attr('data-selected', 'true');
            if (cascade) {
                $children = $node.find('ul>li');
                for (i = 0; i < $children.length; i++) {
                    gj.tree.methods.select($tree, $($children[i]), cascade);
                }
            }
        }
    },
    
    unselectAll: function ($tree) {
        var i, $nodes = $tree.find('ul>li');
        for (i = 0; i < $nodes.length; i++) {
            gj.tree.methods.unselect($tree, $($nodes[i]), true);
        }
        return $tree;
    },

    unselect: function ($tree, $node, cascade) {
        var i, $children, data = $tree.data();
        if ($node.attr('data-selected') === 'true' && gj.tree.events.unselect($tree, $node) !== false) {
            $node.removeClass($tree.data().style.active).removeAttr('data-selected');
            if (cascade) {
                $children = $node.find('ul li');
                for (i = 0; i < $children.length; i++) {
                    gj.tree.methods.unselect($tree, $($children[i]), cascade);
                }
            }
        }
    },

    getSelections: function ($list) {
        var i, $node, children,
            result = [],
            $nodes = $list.children('li');
        if ($nodes && $nodes.length) {
            for (i = 0; i < $nodes.length; i++) {
                $node = $($nodes[i]);
                if ($node.attr('data-selected') === 'true') {
                    result.push($node.attr('data-id'));
                } else if ($node.has('ul')) {
                    children = gj.tree.methods.getSelections($node.children('ul'));
                    if (children.length) {
                        result = result.concat(children);
                    }
                }
            }
        }

        return result;
    },

    getDataById: function ($tree, id, records) {
        var i,
            result = undefined,
            data = $tree.data();
        if (data.primaryKey) {
            for (i = 0; i < records.length; i++) {
                if (id === records[i][data.primaryKey]) {
                    result = records[i];
                    break;
                } else if (records[i][data.childrenField] && records[i][data.childrenField].length) {
                    result = gj.tree.methods.getDataById($tree, id, records[i][data.childrenField]);
                    if (result) {
                        break;
                    }
                }
            }
        }
        return result;
    },

    getDataByText: function ($tree, text, records) {
        var i, id,
            result = undefined,
            data = $tree.data();
        for (i = 0; i < records.length; i++) {
            if (text === records[i][data.textField]) {
                result = records[i];
                break;
            } else if (records[i][data.childrenField] && records[i][data.childrenField].length) {
                result = gj.tree.methods.getDataByText($tree, text, records[i][data.childrenField]);
                if (result) {
                    break;
                }
            }
        }
        return result;
    },

    getNodeById: function ($list, id) {
        var i, $node,
            $result = undefined,
            $nodes = $list.children('li');
        if ($nodes && $nodes.length) {
            for (i = 0; i < $nodes.length; i++) {
                $node = $($nodes[i]);
                if (id == $node.attr('data-id')) {
                    $result = $node;
                    break;
                } else if ($node.has('ul')) {
                    $result = gj.tree.methods.getNodeById($node.children('ul'), id);
                    if ($result) {
                        break;
                    }
                }
            }
        }
        return $result;
    },

    getNodeByText: function ($list, text) {
        var i, $node,
            $result = undefined,
            $nodes = $list.children('li');
        if ($nodes && $nodes.length) {
            for (i = 0; i < $nodes.length; i++) {
                $node = $($nodes[i]);
                if (text === $node.children('[data-role="display"]').text()) {
                    $result = $node;
                    break;
                } else if ($node.has('ul')) {
                    $result = gj.tree.methods.getNodeByText($node.children('ul'), text);
                    if ($result) {
                        break;
                    }
                }
            }
        }
        return $result;
    },

    append: function ($tree, data, $parent, position) {
        if (!$parent || !$parent.length) {
            $parent = $tree.children('ul');
        }
        gj.tree.methods.appendNode($tree, $parent, data, undefined, position);

        return $tree;
    }
}
/**
    var self = this,
        methods = gj.tree.methods;

    self.reload = function (params) {
        return gj.widget.prototype.reload.call(this, params);
    };

    self.render = function (response) {
        return methods.render(this, response);
    };


    /**
     * Append node to the tree.
        return methods.append(this, data, $parentNode, position);
    };

    self.removeNode = function ($node) {
        return methods.removeNode(this, $node);
    };

    self.destroy = function () { };

    /**
     * Expand node from the tree.
        return methods.expand(this, $node, cascade);
    };

    /**
     * Collapse node from the tree.
        return methods.collapse(this, $node, cascade);
    };

    /**
     * Expand all tree nodes
        return methods.expandAll(this);
    };

    /**
     * Collapse all tree nodes
        return methods.collapseAll(this);
    };

    /**
     * Return node data by id of the record.
        return methods.getDataById(this, id, this.data('records'));
    };

    /**
     * Return node data by text.
        return methods.getDataByText(this, text, this.data('records'));
    };

    /**
     * Return node by id of the record.
        return methods.getNodeById(this.children('ul'), id);
    };

    /**
     * Return node by text.
        return methods.getNodeByText(this.children('ul'), text);
    };

    self.findNode = function (id) { };

    /**
     * Select all tree nodes
        return methods.selectAll(this);
    };

    /**
     * Unselect all tree nodes
        return methods.unselectAll(this);
    };

    /**
     * Return an array with the ids of the selected nodes.
        return methods.getSelections(this.children('ul'));
    };

    $.extend($element, self);
    if ('true' !== $element.attr('data-tree')) {
        methods.init.apply($element, arguments);
    }

    return $element;
};

gj.tree.widget.prototype = new gj.widget();
gj.tree.widget.constructor = gj.tree.widget;

(function ($) {
    $.fn.tree = function (method) {
        var $widget;
        if (typeof method === 'object' || !method) {
            return new gj.tree.widget(this, arguments);
        } else {
            $widget = new gj.tree.widget(this, null);
            if ($widget[method]) {
                return $widget[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else {
                throw 'Method ' + method + ' does not exist.';
            }
        }
    };
})(jQuery);