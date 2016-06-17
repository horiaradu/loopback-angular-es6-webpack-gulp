'use strict';

import gulp     from 'gulp';
import path     from 'path';
import rimraf from 'rimraf';
import del from 'del';
import eslint from 'gulp-eslint';

import Karma from 'karma';
import mocha from 'gulp-mocha';
import babelRegister from 'babel-core/register';
import istanbul from 'gulp-istanbul';
import {Instrumenter} from 'isparta';

import runSequence from 'run-sequence';

const client = 'client',
  server = 'server',
  common = 'common',
  output = 'build',
  coverageServer = 'coverage/server',
  coverageClient = 'coverage/client';

// helper method for resolving client paths
let resolveToClient = (glob) => {
  glob = glob || '';
  return path.join(client, 'src', glob); // client/src/{glob}
};

// helper method for resolving server paths
let resolveToServer = (glob) => {
  glob = glob || '';
  return path.join(server, glob); // server/{glob}
};

let resolveToCommon = (glob) => path.join(common, glob || '');

// map of all paths
let paths = {
  clientJS: resolveToClient('**/*.js'), // client js
  serverJS: resolveToServer('**/*.js'), // server js
  commonJS: resolveToCommon('**/*.js'),
  css: resolveToClient('**/*.css'),
  html: [
    resolveToClient('**/*.html'),
    path.join(client, 'index.html')
  ],
  output: output
};

gulp.task('clean-build', (done) => rimraf(output, done));

gulp.task('eslint', () =>
  gulp.src([
    '**/*.js',
    '!node_modules/**',
    '!coverage/**',
    '!build/**',
    '!**/lb-services.js'
  ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
);

gulp.task('test-client', ['clean-coverage:client'], (done) =>
  new Karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start()
);

gulp.task('test-client:watch', ['clean-coverage:client'], (done) =>
  new Karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: false,
    autoWatch: true
  }, done).start()
);

function runServerTests(mochaOptions) {
  gulp.src(
    [].concat(
      resolveToServer('!(test)/**/*.js'),
      resolveToCommon('**/*.js')
    )
  )
    .pipe(istanbul({ // Covering files
      instrumenter: Instrumenter,
      includeUntested: true
    }))
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on('finish', () =>
      gulp.src(resolveToServer('test/**/*.js'), {read: false})
        .pipe(mocha(Object.assign({}, mochaOptions,
          {
            recursive: true,
            compilers: {
              js: babelRegister
            }
          }))
        )
        .pipe(istanbul.writeReports({
          dir: coverageServer,
          reportOpts: {dir: coverageServer},
          reporters: ['text', 'text-summary', 'json', 'html']
        }))
    );
}

gulp.task('test-server:bamboo', () =>
  runServerTests({
    reporter: 'mocha-bamboo-reporter',
    reporterOptions: {
      output: 'coverage/unit.backend.json'
    }
  })
);

gulp.task('test-server', ['clean-coverage:server'], () => runServerTests());

gulp.task('test-server:watch', ['test-server'], () => {
  let allPaths = [].concat(paths.serverJS, paths.commonJS);
  gulp.watch(allPaths, ['test-server']);
});

gulp.task('clean-coverage:server', () => del([coverageServer]));

gulp.task('clean-coverage:client', () => del([coverageClient]));

gulp.task('test', (done) => {
  runSequence('eslint', 'test-server', 'test-client', done);
});

gulp.task('test:bamboo', (done) => {
  runSequence('eslint', 'test-server:bamboo', 'test-client', done);
});

