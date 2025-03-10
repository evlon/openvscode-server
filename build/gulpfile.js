/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

// Increase max listeners for event emitters
require('events').EventEmitter.defaultMaxListeners = 100;

const gulp = require('gulp');
const util = require('./lib/util');
const task = require('./lib/task');
const compilation = require('./lib/compilation');
const { monacoTypecheckTask/* , monacoTypecheckWatchTask */ } = require('./gulpfile.editor');
const { compileExtensionsTask, watchExtensionsTask, compileExtensionMediaTask } = require('./gulpfile.extensions');

// Fast compile for development time
const compileApiProposalNames = task.define('compile-api-proposal-names', compilation.compileApiProposalNames());
const compileClientTask = task.define('compile-client', task.series(util.rimraf('out'), util.buildWebNodePaths('out'), compileApiProposalNames, compilation.compileTask('src', 'out', false)));
gulp.task(compileClientTask);

const watchApiProposalNames = task.define('watch-api-proposal-names', compilation.watchApiProposalNames());
const watchClientTask = task.define('watch-client', task.series(util.rimraf('out'), util.buildWebNodePaths('out'), task.parallel(compilation.watchTask('out', false), watchApiProposalNames)));
gulp.task(watchClientTask);

gulp.task(task.define('watch-init', require('./lib/compilation').watchTask('out', false)));

// All
const compileTask = task.define('compile', task.parallel(monacoTypecheckTask, compileClientTask, compileExtensionsTask, compileExtensionMediaTask));
gulp.task(compileTask);

gulp.task(task.define('watch', task.parallel(/* monacoTypecheckWatchTask, */ watchClientTask, watchExtensionsTask)));

// Default
gulp.task('default', compileTask);

process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
	process.exit(1);
});

// Load all the gulpfiles only if running tasks other than the editor tasks
require('glob').sync('gulpfile.*.js', { cwd: __dirname })
	.forEach(f => require(`./${f}`));
