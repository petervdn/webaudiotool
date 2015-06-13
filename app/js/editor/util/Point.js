define([], function() {
	
	function Point(x, y)
	{
		if(typeof x === 'string') x = convertStringToNumber(x);
		if(typeof y === 'string') y = convertStringToNumber(y);
		
		this.x = x;
		this.y = y;
	}

	function convertStringToNumber(stringValue)
	{
		return parseFloat(stringValue.replace('px', ''));
	}

	return Point;
});