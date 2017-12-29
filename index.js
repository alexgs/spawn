#! /usr/bin/env node

const appRoot = require('app-root-path');
const child_process = require( 'child_process' );
const fs = require( 'fs' );
const path = require( 'path' );
const _ = require( 'lodash' );

const APP_ROOT = appRoot.toString();
const DEFAULT_CONFIG_FILE = path.resolve( APP_ROOT, 'config/config.json' );

// Parse command line options -- use custom processing so that subprocess args are not parsed here
const customConfigFile = ( process.argv[2] === '-c' || process.argv[2] === '--config' ) ? process.argv[3] : false;

// Read environment variables from file
const configFilePath = ( customConfigFile ) ? path.resolve( APP_ROOT, customConfigFile ) : DEFAULT_CONFIG_FILE;
const configFile = JSON.parse( fs.readFileSync( configFilePath ) );
const config = configFile.data;

// Spawn a child process
const subprocessArgIndex = ( customConfigFile ) ? 4 : 2;
const command = process.argv[ subprocessArgIndex ];
const args = process.argv.slice( subprocessArgIndex + 1 );
const spawnOptions = {
    cwd: APP_ROOT,
    env: _.merge( {}, config, process.env ),
    shell: true,
    stdio: 'inherit'
};

const child = child_process.spawn( command, args, spawnOptions );
process.on( 'SIGTERM', () => child.kill( 'SIGTERM' ) );
process.on( 'SIGINT', () => child.kill( 'SIGINT' ) );
process.on( 'SIGBREAK', () => child.kill( 'SIGBREAK' ) );
process.on( 'SIGHUP', () => child.kill( 'SIGHUP' ) );

// Exit cleanly, even if a test fails in the child process (or something else goes wrong).
process.exitCode = 0;
