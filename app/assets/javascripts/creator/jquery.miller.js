// This has been heavily modified and patched for use in the creator

(function($) {
 	var methods = {

 		reload_tree_and_open_path : function(identifier, miller_data_url){
 			var _t = this;
 			$.ajax({
				url: miller_data_url, 
				type: 'get', 
				dataType: 'json', 
				success: function(data){
					console.log(_t);
					$(_t).html('');
					window.settings.tree = data;
					$(_t).miller(window.settings);
					$(_t).miller('select_node', identifier);
				}
			})	
 		},
		'getPath': function() {
			var path = [];

			$.each($(this).find('div.path span'), function(key, node) {
					path.push({ 'id': $(node).data('id'), 'name': $(node).text() });
				}
			);

			return path;
		},
		open_node: function(identifier){
			$.each($(this).find('.columns ul:last-of-type li'), function(key, node){
				if($(node).data('id') == identifier ){
					$(node).trigger('click');
				}
			});
		},
		select_node : function(node_identifier){
			path = this.miller('find_path', node_identifier, [], window.settings.tree).reverse() ;
			this.miller('open_node', path);
			for(var i = 0; i < path.length; i++){
				this.miller('open_node', path[i]);
			}

		},
		find_path : function(node_identifier, path, tree){
			var child 		= null;

			for(var i = 0; i < tree.length; i++){
				var node = tree[i];

				if( node['info']['identifier'] == node_identifier){
					path.push(node['info']['identifier']);
					return path
				}

				if(!child  && node['children'] && node['children'].length > 0){
					path = this.miller('find_path', node_identifier, path, node['children']);
					if(path.length > 0){
						path.push(node['info']['identifier']);
						return path;
					}
				}
			}
			return path;
		}			

	};

	$.fn.miller = function(mixed) {
		if (methods[mixed] ) {
			return methods[mixed].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			var miller 			= this;
			var hasFocus 		= false;
			var current_node 	= null;

			 settings = {};
			 $.extend(true, settings, {
						'url': function(id) { return id; },
						'tabindex': 0,
						'openLine' : function(current_line){ },
						'minWidth': 40,
						'carroussel': false,
						'toolbar': {
							'options': {}
						},
						'pane': {
							'options': {}
						}
					},
					mixed
				);
			 window.settings = settings; 

			if (!miller.attr('tabindex')) {
				miller.attr('tabindex', settings.tabindex);
			}

			miller
				.addClass('miller')
				.focus(function() { hasFocus = true; })
				.blur(function() { hasFocus = false; })
			;

			var path = $('<div>', { 'class': 'path' })
				.appendTo(miller)
			;

			var columns = $('<div>', { 'class': 'columns' })
				.appendTo(miller)
			;

			var toolbar = null;

			var node_clicked_event = new Event('node_clicked');

			if (!$.isEmptyObject(settings.toolbar.options)) {
				var toolbar = $('<div>', { 'class': 'toolbar' })
					.appendTo(miller)
				;
			};

			var currentLine = null;

			$(document).keypress(function(event) {
					if (hasFocus && currentLine && event.which != 37 && event.which != 38 && event.which != 39 && event.which != 40) {
						var newCurrentLine = currentLine.parent().children().filter(function() { return $(this).text().match(new RegExp('^' + String.fromCharCode(event.which))); }).first();

						if (newCurrentLine.length) {
							currentLine = newCurrentLine.click();
						}
					}
				}
			);

			$(document).keydown(function(event) {

					if (hasFocus && currentLine && (event.which == 13 || event.which == 37 || event.which == 38 || event.which == 39 || event.which == 40)) {
						var newCurrentLine = [];
						var scrollTop = currentLine.parent().scrollTop();

						switch (event.which) {
							case 13:
								settings.openLine(current_node);
								break;	
							case 37:
								newCurrentLine = currentLine.parent().prev().prev().find('li.parentSelected');
								break;
							case 38:
								newCurrentLine = currentLine.prev();

								if (!newCurrentLine.length && settings.carroussel) {
									newCurrentLine = currentLine.parent().find('li:last');
									scrollTop = newCurrentLine.position().top;
								}
								break;

							case 39:
								newCurrentLine = currentLine.parent().next().next().find('li:first');
								break;

							case 40:
								newCurrentLine = currentLine.next();

								if (!newCurrentLine.length && settings.carroussel) {
									newCurrentLine = currentLine.parent().find('li:first');
									scrollTop = 0;
								}
								break;
						}


						if (newCurrentLine.length && !newCurrentLine.parent().hasClass('pane')) {
							currentLine = newCurrentLine.click();
						}

						return false;
					}
				}
			);

			var removeNextColumns = function() {
					var line = $(this);

					var column = line.parent();

					column
						.nextAll()
							.slice(1)
								.remove()
					;

					column
						.find('li')
							.removeClass('selected parentSelected')
					;

					line.addClass(line.hasClass('parent') ? 'parentSelected' : 'selected');

					var node = $('<span>', { 'text': line.text() })
						.data('id', line.data('id'))
						.click(function() {
								columns
									.children()
										.slice((($(this).index() * 2) + 4))
											.remove()
								;
								columns
									.children('ul:last')
										.find('li')
											.removeClass('parentSelected')
								;
								path
									.children()
										.slice($(this).index() + 1)
											.remove()
								;
							}
						)
						.appendTo(path)
					;
					
					var child = column.index();

					child -= (child - (child / 2));

					path
						.scrollLeft(node.position().left)
						.children()
							.slice(child, -1)
								.remove()
					;
				}
			;

			var buildColumn = function(lines) {


					if (lines == null) {
						$('li.parentLoading').remove();
					} else {
						if (currentLine && toolbar) {
							toolbar.children().remove();

									

							$.each(settings.toolbar.options, function(key, callback) {
									$('<span>', { 'text': key })
										.click(function() { callback.call(miller, currentLine.data('id')) })
										.appendTo(toolbar)
									;
								}
							);
						}

						if (currentLine) {
							var currentColumn = currentLine.parent();
							var scroll = 0;
							var scrollTop = currentColumn.scrollTop();
							var topOfCurrentLine = currentLine.position().top;

							if (topOfCurrentLine < 0) {
								scroll = topOfCurrentLine;
							} else {
								var bottomOfCurrentLine = currentLine.position().top + currentLine.height();
								var heightOfCurrentColumn = currentColumn.height();

								if (bottomOfCurrentLine > heightOfCurrentColumn) {
									scroll = bottomOfCurrentLine - heightOfCurrentColumn;
								}
							}

							currentColumn.scrollTop(scrollTop + scroll);
						}

						var width = 0;


						var lastGrip = columns.children('div.grip:last')[0];

						if (lastGrip) {
							lastGrip = $(lastGrip);
							width = lastGrip.position().left + lastGrip.width() + columns.scrollLeft();
						}
						
						if (lines.length <= 0) {
							var line = $('li.parentLoading')
								.removeClass('parent')
								.addClass('selected')
							;

							if (!$.isEmptyObject(settings.pane.options)) {
								var pane = $('<ul>')
									.css({ 'top': 0, 'left': width })
									.addClass('pane')
								;

								var id = line.data('id');

								$.each(settings.pane.options, function(key, callback) {
										$('<li>', { 'text': key })
											.click(function() { callback.call(miller, currentLine.data('id')) })
											.appendTo(pane)
										;
									}
								);

								columns
									.append(pane)
									.scrollLeft(width + pane.width())
								;
							}
						} else {
							$('li.parentLoading').addClass('parentSelected');

							var column = $('<ul>')
								.css({ 'top': 0, 'left': width })
							;	
							$.each(lines, function(id, data) {

									var line = $('<li>', { 'text': data['name'] })
										.data('id', data['id'])
										.click(removeNextColumns)
										.click(getLines)
										.on('dblclick', function(){settings.openLine(current_node); })
										.appendTo(column)
									;

									if (data['children'] && data['children'].length > 0) {
										line.addClass('parent');

									}
								}
							);

							columns
								.append(column)
								.scrollLeft(width += column.width())
								.append(
									$('<div>', { 'class': 'grip' })
										.css({ 'top': 0, 'left': width })
										.mousedown(function(event) {
												var x = event.pageX;
												var cursor = columns.css('cursor');

												columns
													.css('cursor', 'col-resize')
													.mousemove(function(event) {
															var delta = event.pageX - x;
															var newWidth = column.width() + delta;

															if (newWidth > settings.minWidth) {
																column
																	.width(newWidth)
																	.nextAll()
																		.each(function() {
																				$(this).css('left', $(this).position().left + delta + columns.scrollLeft());
																			}
																		)
																;
															}

															x = event.pageX;
														}
													)
													.mouseup(function() {
															columns
																.off('mousemove')
																.css('cursor', cursor)
															;
														}
													)
												;
											}
										)
								)
							;
						}
					}
				}
			;

			


			var searchTree = function(nodeID, tree){
				var child = null;
				for(var i = 0; i < tree.length; i++){
					var node = tree[i];

					if( node['id'] == nodeID){
						child = node; 
					}

					if(!child  && node['children'] && node['children'].length > 0){
						child =  searchTree(nodeID, node['children']);
					}
				}
				return child
			}


			var getLines = function(event) {

				if(event == null || $(this).data('id') == null){
					current_node = null;
					buildColumn(settings.tree);
				} else {
					currentLine = $(event.currentTarget);
					parent 		= $(this).data('id');
					current_node = searchTree(parent, settings.tree);


					if(current_node['children'] != null && current_node['children'].length > 0) {
						buildColumn(current_node['children']);								
					}
				}

				if(settings.toolbar['preRender']){
					settings.toolbar['preRender'].apply(this, [current_node, path]);						
				}
					
			}
			;

			// $.getJSON(settings.url(), buildColumn);
			getLines('');
			return miller;
		}
	};
})(jQuery);
