module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig(
		{
			ts: {
				base: {
					src: ['../app/**/*.ts'],
					//src: ['../app/ts/editor/code/CodeGenerator.ts'],
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