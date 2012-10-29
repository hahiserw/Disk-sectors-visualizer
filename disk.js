/*
 * Disk class for Disk sectors visualizer
 *
 * Draws blocks in grid onto the canvas with podanym poprzednio context
 */


// Nice constructor :D
var Disk = function( LBA, blockSize, data ) {
	this.lba = LBA;
	this.blockSize = blockSize;
	this.data = data;
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
	console.log( "resize", width, height );
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
		Math.floor( this.width / ( this.blockWidth + this.blockMargin ) );
	this.blocksPerPage =
		Math.floor( this.height / ( this.blockHeight + this.blockMargin ) );
};

Disk.prototype.changeBlockStyle = function( x, y, margin ) {
	margin = margin || this.blockMargin;
	if( this.blockWidth + x > 0 && this.blockHeight + y > 0 && margin >= 0 )
		this.blockStyle( this.blockWidth + x, this.blockHeight + y, margin )
};

// Draws fragment of map according to start block
Disk.prototype.visualize = function() {

	if( this.width <= 0 || this.height <= 0 )
		return;

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

	// Put every block onto the canvas
	for( var i = 0; i < this.data.length; i++ )
	{
		// Skip to start block
		if( this.data[i] < this.offset.current * this.blockSize )
			continue;

		// Draw a block based on index and access time
		var index = Math.floor( this.data[i] / this.blockSize );
		var color = this.data[i] % this.blockSize;

		// Compute positions
		var x = ( index - this.offset.current ) % this.blocksPerLine;
		var y = Math.floor( ( index - this.offset.current ) / this.blocksPerLine );

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
// console.log( this.offset, this.blocksPerLine );
	// Info text
	var data =
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

		var index = Math.floor( this.data[i] / this.blockSize );
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

	var change =
		x +
		y * this.disk.blocksPerLine +
		page * this.disk.blocksPerPage * this.disk.blocksPerLine;

	if( 0 <= this.current + change && this.current + change <= this.last )
		this.current += change;

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
