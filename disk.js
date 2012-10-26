/*
 * Disk class for Disk sectors visualizer
 */


var Disk = function( LBA, blockSize, data ) {
	this.lba = LBA;
	this.blockSize = blockSize;
	this.data = data;
};

Disk.prototype.sizes = function( width, height, blockWidth, blockHeight ) {
	this.width = width;
	this.height = height;
	this.blockWidth = blockWidth;
	this.blockHeight = blockHeight;
}

Disk.prototype.visualize = function( context ) {
	for( var i = 0; i < this.data.length; i++ )
		;
}