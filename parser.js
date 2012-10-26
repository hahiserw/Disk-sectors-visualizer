/*
 * Parser for Disk sectrors visualizer
 */


var Parser = function() {

	this.header_length = 8;
	this.header = this.nop;
	this.done = this.nop;
	this.error = this.nop;

};


Parser.prototype.feed = function( text ) {

	var
		data,
		lines = [],
		header = {},
		convert = /^(.+)\s+:\s+(.+?)\s*$/;

	// A lot of memory for a large text...
	lines = text.split( "\n" );

	// First 8 lines are a header.

	header["About"] = lines[0];

	for( var i = 1; i < this.header_length; i++ ) {
		data = lines[i].match( convert );
		if( data !== null )
			header[data[1]] = data[2];
	}

	this.header( header );

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
		case "done":
			this.done = callback;
			break;
		case "error":
			this.error = callback;
			break;
	}

}
