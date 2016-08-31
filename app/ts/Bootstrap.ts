declare var requirejs:any;

requirejs.config({
	baseUrl: 'ts',
	waitSeconds: 15,
	paths: {
	},
	map: {},
	shim: {
	}
});

requirejs(['editor/Editor'], (Editor) => {
	console.log('Main!', Editor);
});
