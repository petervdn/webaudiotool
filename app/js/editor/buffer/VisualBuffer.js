define([
	'jquery',
	'Buffer'
], function(
	$,
	Buffer
){
	function VisualBuffer(buffer)
	{
		this.buffer = buffer;

		this.$element = $('<div>', {class: 'buffer'});

		// add title
		this.$element.append($('<h3>', {text: buffer.id}));

		// file drop
		this.$element[0].ondragover = function () { return false; };
		this.$element[0].ondragend = function () { return false; };
		this.$element[0].ondrop = function (e)
		{
		  this.className = '';
		  e.preventDefault();

		  var file = e.dataTransfer.files[0];
		  var reader = new FileReader();
		  reader.onload = function (event) {
		    console.log(event.target);
		    //holder.style.background = 'url(' + event.target.result + ') no-repeat center';
		  };
		  console.log(file);
		  

		  return false;
		};
	}

	return VisualBuffer;
});