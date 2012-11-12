/*
 * Disk and Offset class for Disk sectors visualizer
 *
 * Draws blocks in grid onto the canvas.
 * Disk has methods for setting board and block parameters.
 * And one big method to get it all together and draw a gird.
 * After every board size change some variables are computed again.
 * Offset has methods to navigate through board.
 */


// Nice constructor :D
var Disk = function( LBA, blockSize, data ) {

	this.lba = LBA;
	this.blockSize = blockSize;

	this.data = data;
	// Pointer to the current start data block
	this.dataOffset = 0;

	this.offset = new Offset( this, LBA );

};


// Initialize board
Disk.prototype.board = function( context, info, width, height ) {

	this.context = context;
	this.info = info;

	this.width = width;
	this.height = height;

};

Disk.prototype.boardResize = function( width, height ) {

	if( this.width <= 0 || this.height <= 0 )
		return;

	this.width = width;
	this.height = height;

	// Compute quantity of blocks on page once again
	this.blockStyle( this.blockWidth, this.blockHeight, this.blockMargin );

};

// Set style for blocks
Disk.prototype.blockStyle = function( width, height, margin ) {

	if( width <= 0 || height <= 0 || margin < 0 )
		return;

	this.blockWidth = width;
	this.blockHeight = height;
	this.blockMargin = margin;

	// Full(!) blocks per line
	this.blocksPerLine =
		( this.width / ( this.blockWidth + this.blockMargin ) ) | 0;
	this.blocksPerPage =
		( this.height / ( this.blockHeight + this.blockMargin ) ) | 0;

};

Disk.prototype.changeBlockStyle = function( x, y, margin ) {

	var newWidth = this.blockWidth + x;
	var newHeight = this.blockHeight + y;

	// margin = margin || this.blockMargin;
	if( margin === undefined )
		margin = ( newWidth + newHeight < 10 )? 0: 1;
	if( newWidth > 0 && newHeight > 0 && margin >= 0 )
		this.blockStyle( newWidth, newHeight, margin )

};


// Draws fragment of map according to current offset
Disk.prototype.visualize = function() {

	var
		// colors: oh god (bad block), not that bad, not good, damn
		codes = [ "#000000", "#008000", "#ff8000", "#ff0000" ],
		blockWidth = this.blockWidth + this.blockMargin,
		blockHeight = this.blockHeight + this.blockMargin;
	var
		width = blockWidth * this.blocksPerLine,
		height = blockHeight * this.blocksPerPage;


	// Set drawing style for board
	this.context.save();
	this.context.fillStyle = "#f5f5f5";
	this.context.fillRect( 0, 0, this.width, this.height );


	// Draw grid
	if( this.blockMargin > 0 ) {
		
		this.context.save();
		this.context.fillStyle = "#ffffff";
		
		// Draw vertical lines
		for( var x = 0; x <= this.blocksPerLine; x++ )
			this.context.fillRect( x * blockWidth, 0, this.blockMargin, height );

		// Draw horizontal lines
		for( var y = 0; y <= this.blocksPerPage; y++ )
			this.context.fillRect( 0, y * blockHeight, width, this.blockMargin );

		this.context.restore();

	}


	// There will be a piece of code that gets offset from 'cache' array
	// It can be optimalised to not draw map again if after last block is only empty space


	// Put every block onto the canvas
	for( var i = 0; i < this.blocksPerPage * this.blocksPerLine; i++ )
	{

		// Draw a block based on index and access time
		var index = ( this.data[this.dataOffset+i] / this.blockSize ) | 0;
		var color = this.data[this.dataOffset+i] % this.blockSize;

		// Compute positions
		var base = index - this.offset.current;
		var x = base % this.blocksPerLine;
		var y = ( base / this.blocksPerLine ) | 0;

		// Stop drawing when end of board is reached
		if( y >= this.blocksPerPage )
			break;

		// Draw block
		this.context.save();
		this.context.fillStyle = codes[color];
		this.context.fillRect( x * blockWidth + this.blockMargin, y * blockHeight + this.blockMargin,
			this.blockWidth, this.blockHeight );
		this.context.restore();

	}


	// TODO: paint black space after last lba ||
	// don't let scroll after last lba ( && modify % value to be 100% at the end )


	// Info text
	//http://en.wikipedia.org/wiki/Logical_block_addressing
	var data =
		"LBA: " +
		this.offset.current + " - " + ( this.offset.current + this.blocksPerLine * this.blocksPerPage ) +
		" / " + this.lba +
		" (" + ( Math.round( ( this.offset.current / this.lba ) * 1000000 ) / 10000 ) + "%)";
	this.info.innerHTML = data;


	this.context.restore();

};


// Converts data array to text format
Disk.prototype.textualize = function( start ) {

	return;
	// 'Colors'
	var
		data = "",
		codes = [ "#", "+", "%", "&" ];
	// bacground = ".";

	for( var i = 0; i < this.data.length; i++ )
	{
		// Insert checking for range here

		var index = ( this.data[i] / this.blockSize ) | 0;
		var color = this.data[i] % this.blockSize;

		// for( var j = index_last; j < index; j++ )
		// 	data += ".";
		// data += codes[color];

	}

};


var Offset = function( disk, lba ) {

	this.disk = disk;

	this.current = 0;
	this.last = lba;

};

Offset.prototype.move = function( x, y, page ) {

	jump =
		x +
		y * this.disk.blocksPerLine +
		page * this.disk.blocksPerPage * this.disk.blocksPerLine;

	if( jump === 0 )
		return;

	// Jump out of range
	if( 0 > this.current + jump || this.current + jump > this.last )
		return;

	console.log( "" );

	// Get offset and add jump. Search for another block from here.
	// First one will show how far to move the data pointer.
	
	// Bierze offset i dodaje skok.
	// Od/do tego miejsca zaczyna szukać kolejnego bloku.
	// Pierwszego, który powinien znajdować się na ekranie.
	// Powstałe przesunięcie posłuży do przesunięcia wskaźnika na dane.

	// Compute dataOffset
	if( jump > 0 ) { // Go down

		for( var i = 0; i < jump; i++ ) {
			var index = ( this.disk.data[ this.disk.dataOffset + i ] / this.disk.blockSize ) | 0;
			if( index >= this.current )
				break;
			// Jeżeli nic nie znajdzie możnaby na tym skończyć,
			// ale przy kolejnych próbach skok musiałby się zacząć
			// od przesunięcia, na którym właśnie przerwano.
		}

	} else { // Go up

		for( var i = 0; i > jump; i-- ) {
			var index = ( this.disk.data[ this.disk.dataOffset + i ] / this.disk.blockSize ) | 0;
			if( index <= this.current )
				break;
		}

		console.log( "last data index", index );

	}

	this.disk.dataOffset += i;

	this.current += jump;

	console.log( "jump", jump, "data jump", i );		
	console.log( "offset", this.current, "dataOffset", this.disk.dataOffset );
	console.log( "data index", ( this.disk.data[ this.disk.dataOffset ] / this.disk.blockSize ) | 0 );

};

Offset.prototype.start = function() {
	this.current = 0;
};

Offset.prototype.end = function() {
	this.current = this.last - this.disk.blocksPerLine * this.disk.blocksPerPage;
};

Offset.prototype.blockPrev = function( bad ) {
	//
};

Offset.prototype.blockNext = function( bad ) {
	//
};


var Cache = function() {

	this.indexes = [ /* 24, 34 ,223 */ ];

};

// Create cache map
Cache.prototype.createMap = function( step ) { // lba * 0.0005

	if( step <= 0 )
		return;
	else
		step |= 0;

	for( var i = 0, j = 0; i < data.length; i += step )
		this.indexes[j++] = data[i];

}

Cache.prototype.getIndexByOffset = function( from, to ) {
	
	if( to === undefined );

	var index = this.indexes.indexOf( from );

	// If index is not in cache compute it
	if( index === -1 ) {
	}

};