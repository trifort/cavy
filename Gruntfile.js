module.exports = function(grunt) {
	var pkg = grunt.file.readJSON('package.json');
	var setting = {
		pkg: pkg,
		concat: {
			release: {
				src: pkg.target,
				dest: '<%= pkg.name %>.concat.js'
			},
			debug: {
				src: pkg.target,
				dest: '<%= pkg.name %>.js'
			}
		},
		uglify: {
			my_target: {
				files: {
					'<%= pkg.name %>.js': '<%= pkg.name %>.concat.js'
				}
			},
			options: {
				banner: '/**\n\
 * cavy.js(http://trifort.jp/library/cavy)\n\
 * Copyright (c) 2013 TriFort.inc\n\
 * version <%= pkg.version %>\n\
 * <%= pkg.license %>\n\
 * \n\
 * Matrix2D\n\
 * Visit http://createjs.com/ for documentation, updates and examples.\n\
 * Copyright (c) 2010 gskinner.com, inc.\n\
 */\n',
	 			compress: true,
				beautify: false//,
				//mangle: true
				//sourceMap: 'cavy.source.js',
				//sourceMapRoot: 'http://example.com/path/to/src/', // the location to find your original source
			}
		},
		jsdoc : {
			dist : {
				src: ['<%= pkg.readmeFilename %>','js/*.js'],
				options: {
					destination: 'doc',
					template: 'themes/bootstrap'
				}
			}
		},
		watch: {
			debug: {
				files: ['js/*.js','Gruntfile.js'],
				tasks: ['concat:debug']
			},
			release: {
				files: ['js/*.js','Gruntfile.js'],
				tasks: ['build']
			}
		}
	};
	grunt.initConfig(setting);
	// loadNpmTasksを変更
	var taskName;
	for(taskName in pkg.devDependencies) {
		if(taskName.substring(0, 6) == 'grunt-') {
			grunt.loadNpmTasks(taskName);
		}
	}
	grunt.registerTask('build', ['concat:debug','concat:release','uglify']);
	grunt.registerTask('compile', ['concat:debug','uglify']);
	grunt.registerTask('default', ['watch:release']);
	grunt.registerTask('doc', ['jsdoc']);
};