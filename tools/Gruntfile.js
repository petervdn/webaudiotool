module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig(
		{
			ts: {
				base: {
					src: ['../app/js/**/*.ts'],
					dest: '',
					options: {
						module: 'amd',
						target: 'es6',
						basePath: '',
						sourceMap: false,
						declaration: false
					}
				}
			}
		}
	);

	grunt.loadNpmTasks("grunt-ts");
};