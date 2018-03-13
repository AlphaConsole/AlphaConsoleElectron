'use strict';
const electronPackager = require('electron-packager');

module.exports = grunt => {
	grunt.registerMultiTask('electron', 'Package Electron apps', function () {
		const done = this.async();

		electronPackager(this.options(), err => {
			if (err) {
				grunt.warn(err);
				done();
				return;
			}

			done();
		});
	});
};
