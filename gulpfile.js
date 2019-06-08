const fs = require('fs');
const path = require('path');
const {
  series, src, dest, watch,
} = require('gulp');
const babel = require('gulp-babel');
const uglifyjs = require('gulp-uglify');
const { pipeline } = require('readable-stream');
const concat = require('gulp-concat');
const del = require('del');
const replace = require('gulp-replace');

const rootDir = __dirname;
const distDir = path.resolve(rootDir, 'dist');

function clean() {
  return del(['dist/avd.min.js', 'dist/tmp.js']);
}

function build() {
  const content = fs.readFileSync(distDir.concat('/tmp.js'));
  return pipeline(
    src(['lib/index.js']),
    babel({ presets: ['@babel/preset-env'] }),
    concat('avd.min.js'),
    replace('/*injected content*/', content),
    uglifyjs(),
    dest('dist'),
  );
}
function buildDev() {
  const content = fs.readFileSync(distDir.concat('/tmp.js'));
  return pipeline(
    src(['lib/index.js']),
    babel({ presets: ['@babel/preset-env'] }),
    concat('avd.js'),
    replace('/*injected content*/', content),
    dest('dist'),
  );
}

// buildTmp
function buildTmp() {
  return pipeline(
    src(['lib/*.js', '!lib/index.js']),
    babel({ presets: ['@babel/preset-env'] }),
    concat('tmp.js'),
    dest('dist'),
  );
}

exports.build = series(clean, buildTmp, build);
exports.buildDev = series(clean, buildTmp, buildDev);

exports.default = function dev() {
  watch('lib/*.js', exports.buildDev);
};
