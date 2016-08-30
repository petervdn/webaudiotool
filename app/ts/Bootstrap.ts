declare var requirejs:any;

requirejs.config({
	baseUrl: 'js/ts',
	waitSeconds: 15,
	paths: {
		requireLib:     'vendor/require/require'
	},
	map: {},
	shim: {
	}
});

requirejs(['Main'], (Main) => {
	console.log('Main!', Main);
});
