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
		ts: {
			dist: {
				src: ['ts/**/*.ts'],
				outDir: 'dist',
				options: {
					sourcemap: false,
					declaration: false,
					removeComments: false
				}
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
				beautify: false
			}
		},
		jsdoc : {
			dist : {
				src: ['<%= pkg.readmeFilename %>','dist/*.js'],
				options: {
					destination: 'doc',
					template: 'themes/bootstrap'
				}
			}
		},
		watch: {
			script: {
				files: ['js/*.js','Gruntfile.js'],
				tasks: ['build']
			},
			typescript: {
				files: ['ts/**/*.ts','Gruntfile.js'],
				tasks: ['ts']
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
	grunt.registerTask('default', ['watch:script']);
	grunt.registerTask('doc', ['jsdoc']);
};