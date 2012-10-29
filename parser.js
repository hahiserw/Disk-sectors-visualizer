/*
 * Parser for Disk sectrors visualizer
 *
 * Converts HDDscan for Win2k/XP format to array of blocks with colors.
 * "Block start at 47616 time 203ms" -> 47616 + 2 (block + color)
 *
 * First 8 lines are header. Parser reads other lines searching for records
 * with block's numbers and converts it to array for feature use.
 */


var Parser = function() {

	this.headerLength = 9;

	this.header = this.nop;
	this.data = this.nop;
	this.error = this.nop;

};


Parser.prototype.nop = function() {};


Parser.prototype.feed = function( text, onlyBadBlocks ) {

	if( !text )
		return;

	onlyBadBlocks = !!onlyBadBlocks;

	var
		data,
		header = {},
		re = {
			header: /^(.+)\s+:\s+(.+?)\s*$/,
			block: /^Block start at (\d+) time (\d+)ms$/,
			badBlock: /^Bad block found, start LBA : (\d+)$/
		};

	// A lot of memory for a large text...
	var lines = text.split( "\n" );

	if( lines.length < this.headerLength )
		return;

	
	// Header start
	header["About"] = lines[0]; // No blank lines before header... Not good.

	for( var i = 1; i < this.headerLength; i++ )
	{
		data = lines[i].match( re.header );
		if( data !== null ) {
			var value = data[2];
			if( /^\d+$/.test( value ) )
				value = parseInt( data[2] );
			header[data[1]] = value;
		}
	}

	this.header( header );

	
	data = [];

	for( var i = this.headerLength, j = 0; i < lines.length; i++ )
	{
		var line = lines[i].match( re.badBlock );
		// Bad block found, start LBA : \d+
		if( line !== null ) {
			data[j++] = parseInt( line[1] );
		} else
			if( !onlyBadBlocks ) {
				line = lines[i].match( re.block );
				// Block start at \d+ time \d+ms
				if( line !== null ) {
					// Chose color depending on the access time
					var color = 0;
					var access = parseInt( line[2] );
					if( access !== 0 ) {
						color++;
						if( 150 < access )
							color++;
						else
							if( 500 < access )
								color++;
					}
					data[j++] = parseInt( line[1] ) + color;
				}
			}
	}

	this.data( data );

}


// For debuging
Parser.prototype.force = function( event, args ) {
	this[event].apply( this, args );
};


// Events listeners
Parser.prototype.on = function( event, callback ) {

	switch( event ) {
		case "header":
			this.header = callback;
			break;
		case "data":
			this.data = callback;
			break;
		// case "error":
		// 	this.error = callback;
		// 	break;
	}

};
