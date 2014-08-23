function LineBin(width, height, binWidth, binHeight) {
    this.width      = width;
    this.height     = height;
    this.binWidth   = binWidth;
    this.binHeight  = binHeight;
    this.binsWide   = Math.ceil(this.width / this.binWidth);
    this.binsHigh   = Math.ceil(this.height / this.binHeight);
    
    this.bins = new Array(this.binsWide * this.binsHigh);
    for (var i = 0; i < this.bins.length; ++i) {
        this.bins[i] = [];
    }
}

LineBin.prototype.addLine = function(x1, y1, x2, y2, data) {
    
    if (x1 > x2) {
        var tx = x1, ty = y1;
        x1 = x2;
        y1 = y2;
        x2 = tx;
        y2 = ty;
    }

}

LineBin.prototype.insert = function(row, col, data) {
    this.bins[row * this.binsWide + col].push(data);
}


var lattice = new LineBin(2000, 2000, 50, 50);

var lines = [
    [ 10, 10, 300, 200]
];

lines.forEach(function(l) {
    lattice.addLine(l[0], l[1], l[2], l[3], null);
});