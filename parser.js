/*
 * Parser for Disk sectrors visualizer
 */


var Parser = function() {

	this.header_length = 9;
	this.header = this.nop;
	this.data = this.nop;
	this.error = this.nop;

};


Parser.prototype.feed = function( text ) {

	var
		data,
		line,
		lines = [],
		header = {},
		convert = /^(.+)\s+:\s+(.+?)\s*$/,
		block = /^Block start at (\d+) time (\d+)ms$/,
		badBlock = /^Bad block found, start LBA : (\d+)$/;

	// A lot of memory for a large text...
	lines = text.split( "\n" );

	
	// First 8 lines are a header.

	header["About"] = lines[0];

	for( var i = 1; i < this.header_length; i++ )
	{
		data = lines[i].match( convert );
		if( data !== null )
			header[data[1]] = data[2];
	}

	this.header( header );

	
	data = [];
	var line;

	for( var i = 0; i < lines.length - this.header_length; i++ )
	{
		line = lines[i+this.header_length].match( block );
		// Block start at \d+ time \d+ms
		if( line !== null ) {
			data[i] = [ line[1], line[2] ];
		} else {
			// Bad block found, start LBA : \d+
			line = lines[i].match( badBlock );
			if( line !== null )
				data[i] = [ line[1], 0 ];
		}
	}

	this.data( data );

}


Parser.prototype.nop = function() {}


Parser.prototype.force = function( event, args ) {
	this[event].apply( this, args );
}


Parser.prototype.on = function( event, callback ) {

	switch( event ) {
		case "header":
			this.header = callback;
			break;
		case "data":
			this.data = callback;
			break;
		case "error":
			this.error = callback;
			break;
	}

}
