module.exports = function(grunt) {
	var pkg = grunt.file.readJSON('package.json');
	var setting = {
		pkg: pkg,
		concat: {
			dist: {
				src: pkg.target,
				dest: '<%= pkg.name %>.concat.js'
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
	 			//report: "gzip",
				compress: true,
				beautify: false
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
			scripts: {
				files: ['js/*.js','Gruntfile.js'],
				tasks: ['concat','uglify']
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
	grunt.registerTask('compile', ['concat','uglify']);
	grunt.registerTask('default', ['watch']);
	grunt.registerTask('doc', ['jsdoc']);
};