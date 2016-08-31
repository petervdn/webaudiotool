declare var requirejs:any;

requirejs.config({
	baseUrl: 'js',
	waitSeconds: 15,
	paths: {
	},
	map: {
	},
	shim: {
	}
});

requirejs(['Main']);