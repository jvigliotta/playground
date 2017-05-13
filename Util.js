var Util = {

	_GLOBALS: [],
	_OVERRIDES: [],

	init: function(){
		var defaultAlert = alert;

		// override any functions
		this.overrides();

		// native js function overrides
		this._JSOverrides();
	},
	
	alert: function(message, type) {

		if(message && typeof message == 'string') {
			var $bar = $('.message-bar'),
			typeClass = '';

			// determine correct class for message type default to nothing as color is already set in css
			switch(type) {
				case 'error':
					typeClass = 'error';
					break;
				default:
					break;
			};

			// add class
			$bar.addClass(typeClass);

			// insert message
			$bar.find('.message').text(message);

			// show message
			$bar.slideDown();

			// set up events & cleanup
			$bar.find('.close').unbind().bind('click', function(){
				$bar.slideUp().removeClass(typeClass).find('.message').text('');
			});
		}
	},

	override: function(func) {
		func = typeof func == 'string' ? [func] : func;
		
		for(var i = 0, c = func.length; i < c; i++) {
			if(typeof func[i] == 'string' && window[func[i]] != undefined && this._OVERRIDES.indexOf(func[i]) === -1) {
				this._OVERRIDES.push(func[i]);
			}
		}
	},

	// use the override factory to create overridden versions of some of JS's native functions
	// used for more personalization
	overrides: function() {

		alert = this.overrideFactory(alert, function(message, type) {
			// console.log('in');
			if(message && typeof message == 'string') {
				var $bar = $('.message-bar'),
				typeClass = '';

				// determine correct class for message type default to nothing as color is already set in css
				switch(type) {
					case 'error':
						typeClass = 'error';
						break;
					default:
						break;
				};

				// add class
				$bar.addClass(typeClass);

				// insert message
				$bar.find('.message').text(message);

				// show message
				$bar.slideDown();

				// set up events & cleanup
				$bar.find('.close').unbind().bind('click', function(){
					$bar.slideUp().removeClass(typeClass).find('.message').text('');
				});
			}
		});

		confirm = this.overrideFactory(confirm, function(message, options) {

			if(message && typeof message == 'string' ) {
				var confirmModal;
    
				// create modal html if not created already
				if(!$('#confirm-modal').length) {
					// create modal
					$('body').append('<div id="confirm-modal" style="z-index:10000000000;" class="modal fade"><div class="modal-dialog modal-sm" role="document"><div class="modal-content"><div class="modal-header"><h4>Please Confirm</h4><button type="button" class="close" data-dismiss="modal" aria-label="Close" style="position:absolute;top:15px;right:15px;"><span aria-hidden="true">&times;</span></button></div><div class="modal-body clearfix"><span class="message" style="display:inline-block;width:100%;padding:15px;"></span><div class="button-wrap" style="text-align:right;"><input data-dismiss="modal" class="yes btn btn-primary" value="Yes" /><input data-dismiss="modal" class="no btn btn-primary" value="No" style="display:none;" /><input data-dismiss="modal" class="cancel btn btn-default" value="Cancel" /></div></div></div></div></div>');

					// assign modal
					confirmModal = $('#confirm-modal');

					// handle extra styles
					confirmModal.find('input').css({ width: '30%', marginLeft: '2%' });
					confirmModal.find('.button-wrap').css({ paddingTop: '15px', marginTop: '15px', borderTop: '1px solid #CCC' });

					// set up events
					// set up hidden events
					confirmModal.unbind('hidden.bs.modal').bind('hidden.bs.modal', function (e) {
						confirmModal.find('.message').text('');
					});

					confirmModal.find('input').unbind('click').bind('click', function() {
						switch($(this).val()) {
							case 'Yes':
								return true;
								break;
							case 'No':
								return false;
								break;
							case 'Cancel':
							default:
								return 'canceled';
								break;
						}
					});

				} else {
					confirmModal = $('#confirm-modal');
				}

				if(options) {
					for(option in options) {
						switch(option) {
							case 'include_no':
								if(options[option]) confirmModal.find('.no').show();
								break;
							default:
								break;
						}
					}
				}

				// populate the modal
				confirmModal.find('.message').text(message);

				// show confirm modal
				confirmModal.modal('show');
			}
		});
	},

	// returns a function, that returns an existing function or an overridden 
	// version of that function depending on if it's been declared to be overwritten
	overrideFactory: function(orig, mod) {
		var u = this;

		if(typeof orig == 'function' && typeof mod == 'function') {
			return function() {
				return u._OVERRIDES.indexOf(orig.name) !== -1 ? mod.apply(this, arguments) : orig.apply(this, arguments);
			}
		}

		return false;
	},

	_JSOverrides: function() {

		// Array prototype remove function
		// Array.prototype.remove = function() {
		// 	var what, a = arguments, L = a.length, ax;

		// 	while (L && this.length) {
		// 		what = a[--L];
				
		// 		while ((ax = this.indexOf(what)) !== -1) {
		// 			this.splice(ax, 1);
		// 		}
		// 	}

		// 	return this;
		// };
	},

	removeFromArray: function(rem, arr) {
		var what, a = arguments, L = a.length, ax;

		while (L && arr.length) {
			what = a[--L];
			
			while ((ax = arr.indexOf(what)) !== -1) {
				arr.splice(ax, 1);
			}
		}

		return arr;
	},

	// http://stackoverflow.com/questions/11978995/how-to-change-color-of-svg-image-using-css-jquery-svg-image-replacement
	replaceSvgWithSvg: function($img) {

		var imgURL = $img.attr('src'),
			attributes = $img.prop("attributes");

		$.get(imgURL, function(data) {
			// Get the SVG tag, ignore the rest
			var $svg = $(data).find('svg');

			// Remove any invalid XML tags
			$svg = $svg.removeAttr('xmlns:a');

			// Loop through IMG attributes and apply on SVG
			$.each(attributes, function() {
				$svg.attr(this.name, this.value);
			});

			// Replace IMG with SVG
			$img.replaceWith($svg);
		}, 'xml');
	},

	customContextMenu: function(o) {
		// remove any other context menus, only one at a time
		$('.custom-context-menu').remove();

		var menu = '<ul class="custom-context-menu"></ul>',
			html = '',
			ccm = 0,
			actions = [],
			defaults = {

			};

		menu = $(menu).css({
			zIndex: '10000000000000',
			minWidth: '120px',
			position: 'absolute',
			top: o.y + 'px',
			left: o.x + 'px',
			background: '#DDD',
			fontSize: '13px',
			'-webkit-border-radius': '3px',
			'-moz-border-radius': '3px',
			borderRadius: '3px',
			listStyleType: 'none',
			padding: '0px',
			border: '1px solid #CCC',
			webkitBoxShadow: '-5px 5px 26px -6px rgba(0,0,0,1)',
			'-moz-box-shadow': '-5px 5px 26px -6px rgba(0,0,0,1)',
			boxShadow: '-5px 5px 26px -6px rgba(0,0,0,1)',
		});

		if(o.x && o.y && o.menu) {
			for(action in o.menu) {
				html = '<li class="ccm-item ccm-' + ccm + '">' + action + '</li>';
				menu.append(html);

				// store actions to enable once in DOM
				actions['ccm-' + ccm] = o.menu[action].click ? o.menu[action].click : null;
				ccm++;
			}

			// set up menu
			$('body').append(menu);

			// set up li styles
			$('.custom-context-menu li').css({
				padding: '4px 8px',
				borderBottom: '1px solid #CCC',
				cursor: 'pointer',
				color: '#222',
			});

			$('.custom-context-menu li').hover(
				function() {
					$(this).css({
						background: '#CCC',
					});
				},
				function() {
					$(this).css({
						background: 'none',
					});	
				}
			);

			$('.custom-context-menu li:last-child').css({
				borderBottom: 'none',
			});

			// trigger actions
			for(i in actions) {
				$('.' + i).click(actions[i]);
			}

			// remove menu as expected
			$(document).click(function(e) { 
				$('.custom-context-menu').remove();
			});
		}

	},

	// returns deduped array, modified version of example from SO, link below
	// http://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
	// http://stackoverflow.com/users/989121/georg
	removeDuplicates: function(a) {
		var seen = {}, out = [], len = a.length, j = 0, i = 0, item;

		for(; i < len; i++) {
			item = a[i];

			if(seen[item] !== 1) {
				seen[item] = 1;
				out[j++] = item;
			}
		}
		
		return out;
	},

	// should move to server for consistency
	getDate: function(val, type) {
	    return Date.now();
	},

	// should move to server for consistency
	prettyDate: function(timestamp, format) {
		if(this.isNumber(timestamp)) {
			timestamp = parseInt(timestamp);

			var m = 'am',
				a = new Date(timestamp),
				months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
				year = a.getFullYear(),
				month = months[a.getMonth()],
				date = a.getDate(),
				hour = a.getHours(),
				min = a.getMinutes(),
				sec = a.getSeconds();
			
				if(hour > 12) {
					hour -= 12;
					m = 'pm';
				}
				// TODO: work in format
			return month + ' ' + date + ', ' +  year + ' ' + hour + ':' + min + ' ' + m;
		} else {
			return timestamp;
		}
	},

	getTimestamp: function(string) {
		return Date.parse(string);
	},

	isNumber: function(n) {
		return /^\d+$/.test(n);
	},

	roundToEven: function(num) {
		return 2 * Math.round(num / 2);
	},

	formValidation: function(form, trigger) {
		var obj = {
			fields: [],
			addField: function(field, func, error) {
				if(field && typeof func == 'function' && typeof error == 'string') {
					this.fields[field] = { check: func, error: error };
				}
			},
			validate: function(field) {
				for(var i = 0, c = this.fields.length; i < c; i++) {

				}
			},
		};

		return obj;
	},

	buildAttributeString: function(attributes) {
		if(attributes && typeof attributes == 'object') {
			var attributeString = '';

			for(att in attributes) {
				if(attributes[att]) {
					// if item is not an array, add it to one and reassign then loop through and build
					var attrs = !Array.isArray(attributes[att]) ? [attributes[att]] : attributes[att];

					attributeString += ' ' + att + '="' + attrs.join(' ') + '"';
				}
			}
			return attributeString;
		}
	},

	createRadioElement: function(name, values, checked, attributes) {		
		var add = ' ',
			required = false;
		// add class just in case other classes weren't passed in
		if(attributes.class) {
			if(Array.isArray(attributes.class)) {
				attributes.class.push('radio-select');
			} else {
				attributes.class = [attributes.class];
				attributes.class.push('radio-select');
			}
		} else {
			attributes.class = ['radio-select'];
		}		
		
		// add the checked value
		if(checked) attributes.value = checked;

		var data = '<ul ' + this.buildAttributeString(attributes) + '>';
		
		for(var i = 0, y = values.length; i < y; i++) {
			selected = values[i] == checked ? ' class="selected"' : '';
			
			data += '<li' + selected + ' value="' + values[i] + '">' + values[i] + '</li>';
		}
		
		return data += '</ul>';
	},

	customRadioEvents: function() {
		// custom radio select
		$('.radio-select li').click(function() {
			var radio = $(this),
				selected = radio.attr('value'),
				parent = radio.parent(),
				name = parent.attr('name'),
				multi = parent.hasClass('multi');

			if(!radio.hasClass('selected')) {
				if(!multi) {
					parent.children('li').removeClass('selected');
					parent.attr('value', selected);
				} else {
					if(parent.attr('value').length > 0) {
						parent.attr('value', parent.attr('value') + ',' + selected);
					} else {
						parent.attr('value', selected);
					}
				}
				radio.addClass('selected');
			} else {
				if(!multi) {
					parent.attr('value', '');
				} else {
					var val = parent.attr('value').split(',');
					
					val.remove(selected);

					parent.attr('value', val.join(','));
				}

				radio.removeClass('selected');
			}

			parent.trigger({
				type: 'change',
				val: selected,
				name: name,
			});
		});
	},

	randomHash: function(length) {
		var text = '',
			possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',

		// default 5
		length = length ? length : 5;

		for(var i = 0; i < length; i++ ) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		return text;
	},

	validEmail(email) {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	},

	getGet: function() {
		var gVars = window.location.search,
			returnVars = false;

		if(gVars && gVars[0] == '?') {
			returnVars = {};
			gVars = gVars.slice(1, gVars.length);
			gVars = gVars.split('&');

			for(var i = 0, c = gVars.length; i < c; i++) {
				var temp = gVars[i].split('=');
				returnVars[temp[0]] = temp[1];
			}
		}

		return returnVars;
	},

	combineObjects: function(obj1, obj2, force) {
		// if force is set, items will be overwritten in first object
		if(typeof obj1 == 'object' && typeof obj2 == 'object') {
			for (var attrname in obj2) {
				obj1[attrname] = force ? obj2[attrname] : obj1[attrname];
			}
			return obj1;
		} else {
			return false;
		}
	},

	whenDone: function(lengh, cb) {
		var count = 0,
			length = length;

		return {
			update: function(data) {
				if(count++ == length - 1) {
					this.doThis(data);
				}
			},
			doThis: function(data) {
				if(cb && typeof cb == 'function') {
					cb(data);
				}
			}
		}
	},

	// store passed-in global on window object
	setGlobal: function(name, value) {
		// if it exists, set to existing value, if not, set to passed in value
		window[name] = window[name] || value;
		this._GLOBALS[name] = window[name];
	},

	// return stored globals
	getGlobal: function(name) {
		return this._GLOBALS[name] ? this._GLOBALS[name] : null;
	},

	// return all stored globals
	globals: function() {
		return this._GLOBALS;
	},

	autoSpacer: function(options) {

		// must at least have header and row
		if(options && (options.header && options.row)) {
			var defaults = {
				target: '.auto-spaced',
				header: '',
				rowContainer: 'list-rows',
				row: '',
				fixedHeader: false,
				spacing: 'even',
				padding: '8px 10px',
				textAlign: 'left',
				outerBorder: true,
				border: '1px solid #333',
			};

			defaults.rowBorder = defaults.border;
			defaults.headerBorder = defaults.border;

			// merge and overwrite anything in defaults from what's passed in
			options = this.combineObjects(defaults, options, true);

			var container = $('.' + options.target),
				header = $('.' + options.header),
				rowContainer = $('.' + options.rowContainer),
				row = $('.' + options.row);

			if(container.length > 0 && header.length > 0 && row.length > 0) {
				
				var totalWidth = container.width(),
					hCols = header.children(),
					master = [],
					headerStyles = {
						display: 'block',
						float: 'left',
						padding: options.padding,
						textAlign: options['text-align'],
						whiteSpace: 'nowrap',
					},
					rowStyles = headerStyles;

					// handle header and row border styles separately
					headerStyles.borderBottom = options.headerBorder;
					rowStyles.borderBottom = options.rowBorder;

				// get and store the widths to be used for each column
				switch(options.spacing.type) {
					case 'percentage':
						for(var i = 0, y = hCols.length; i < y; i++) {
							// go through each one and size accordingly
							var percent = options.spacing.info[i],
								px = totalWidth * options.spacing.info[i];

							master.push({
								px: px + 'px',
								percent: percent * 100 + '%',
							});
						}
						break;
					case 'even':
					default:
						var px = totalWidth / hCols.length,
							percent = px / totalWidth;

						master = {
							px: px + 'px',
							percent: percent + '%',
						};
						break;
				}

				// set up main border styles
				if(options.outerBorder) {
					container.css({
						borderTop: options.border,
						borderLeft: options.border,
						borderRight: options.border,
					});
				}

				// size header cols
				for(var i = 0, c = hCols.length; i < c; i++) {
					// go through each one and size accordingly	
					$(hCols[i]).css(headerStyles);
					$(hCols[i]).css({
						'min-width': options.spacing.type == 'even' ? master.px : master[i].px,
						width: options.spacing.type == 'even' ? master.percent : master[i].percent,
					});

					if(i != 0) $(hCols[i]).css({borderLeft: options.headerBorder,});
				}

				// size row cols
				for(var i = 0, c = row.length; i < c; i++) {
					
					var rCols = $(row[i]).children();
					
					for(var x = 0, y = rCols.length; x < y; x++) {
						// go through each one and size accordingly
						$(rCols[x]).css(rowStyles);
						$(rCols[x]).css({
							'min-width': options.spacing.type == 'even' ? master.px : master[x].px,
							width: options.spacing.type == 'even' ? master.percent : master[x].percent,
						});

						if(x != 0) $(rCols[x]).css({borderLeft: options.rowBorder,});
					}
				}

				// add fixed header if applicable
				if(options.fixedHeader) {
					var offset = header.height();
					//TODO: make this work
					// header.css({ position: 'absolute', top: offset + 'px', });
					rowContainer.css('padding-top', offset + 'px');
				}
			}

		} else {
			// TODO: set up ability to specify options on the DOM through data attributes
		}
	},
}

Util.init();
