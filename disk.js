/*
 * Disk class for Disk sectors visualizer
 *
 * Draws blocks in grid onto the canvas with podanym poprzednio context
 */


var Disk = function( LBA, blockSize, data, context, info ) {
	this.lba = LBA;
	this.blockSize = blockSize;
	this.data = data;
	this.context = context;
	this.info = info;
	this.offset = 0;
};

Disk.prototype.sizes = function( width, height, blockWidth, blockHeight, blockMargin ) {
	this.width = width - width % blockWidth;
	this.height = height - height % blockHeight;
	this.blockWidth = blockWidth;
	this.blockHeight = blockHeight;
	this.margin = blockMargin;
	this.blocksPerLine = Math.floor( width / blockWidth );
	this.blocksPerPage = Math.floor( height / blockHeight )
};

Disk.prototype.moveOffset = function( x, y, page ) {
	
	var change =
		x +
		y * this.blocksPerLine +
		page * this.blocksPerPage * this.blocksPerLine;

	if( 0 <= this.offset + change && this.offset + change <= this.lba )
		this.offset += change;

};

// Draws fragment of map according to start block
Disk.prototype.visualize = function() {

	// colors: oh god (bad block), not that bad, not good, damn
	var
		codes = [ "#000000", "#008000", "#ff8000", "#ff0000" ],
		blockWidth = this.blockWidth + this.margin,
		blockHeight = this.blockHeight + this.margin;
	var
		width = blockWidth * this.blocksPerLine,
		height = blockHeight * this.blocksPerPage;

	// Set drawing style for board
	this.context.save();
	this.context.fillStyle = "#f5f5f5";
	// this.context.strokeStyle = "#ffffff";
	this.context.fillRect( 0, 0, width, height );

	// Draw grid
	if( this.margin > 0 ) {
		
		this.context.save();
		this.context.fillStyle = "#ffffff";
		
		// Draw vertical lines
		for( var x = 0; x < this.blocksPerLine; x++ )
			this.context.fillRect( x * blockWidth, 0, this.margin, height );

		// Draw horizontal lines
		for( var y = 0; y < this.blocksPerPage; y++ )
			this.context.fillRect( 0, y * blockHeight, width, this.margin );

		this.context.restore();
	}

	// Put every block onto the canvas
	for( var i = 0; i < this.data.length; i++ )
	{
		// Skip to start block
		if( this.data[i] < this.offset * this.blockSize )
			continue;

		// Draw a block based on index and access time
		var index = Math.floor( this.data[i] / this.blockSize );
		var color = this.data[i] % this.blockSize;

		// Compute positions
		var x = ( index - this.offset ) % this.blocksPerLine;
		var y = Math.floor( ( index - this.offset ) / this.blocksPerLine );

		// Stop drawing when end of board is reached
		if( y >= this.blocksPerPage )
			break;

		// Draw block
		this.context.save();
		this.context.fillStyle = codes[color];
		this.context.fillRect( x * blockWidth + this.margin, y * blockHeight + this.margin,
			this.blockWidth, this.blockHeight );
		this.context.restore();
	}

	// Info text
	var data =
		this.offset + " - " + ( this.offset + this.blocksPerLine * this.blocksPerPage ) +
		" (" + ( Math.round( ( this.offset / this.lba ) / 100 ) * 100 ) + "%)";
	this.info.innerHTML = data;

	this.context.restore();

};

// Converts data array to text format
Disk.prototype.textualize = function( start ) {

	// 'Colors'
	var codes = [ "#", "+", "%", "&" ];
	// bacground = ".";

	for( var i = 0; i < this.data.length; i++ )
	{
		//
	}

};

/*

		var base = ( index - start ) * ( this.blockWidth + this.margin );
		var x = ( base % this.width ) + this.margin;
		var y = Math.floor( base / this.width )	* ( this.blockHeight + this.margin ) + this.margin;
*/