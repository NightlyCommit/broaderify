import * as tape from "tape";
import {resolve as resolvePath} from "path";
import {createReadStream} from "fs";
import {Transform as TransformStream} from "stream";
import transform from "../src";

import type {Options} from "../src";

tape('transform', (test) => {
    test.test('should return original source when filter test fails', (test) => {
        let file = resolvePath('test/fixtures/not-transformed/index.js');
        let data: string;

        let options: Options = {
            loaders: [
                {
                    filter: /(.*)\/foo.js/,
                    worker: function (module, content, done) {
                        content = Buffer.from('let bar = \'bar\';\n' + content);

                        done(content);
                    }
                }
            ]
        };

        const transformStream = new TransformStream({
            transform(chunk, encoding, callback) {
                data = chunk.toString();

                callback();
            }
        });

        createReadStream(file)
            .pipe(transform(file, options))
            .pipe(transformStream)
            .on('finish', function () {
                test.same(data, `let foo = 'foo';
`);

                test.end();
            })
            .on('error', (error) => {
                test.fail(error.message);

                test.end();
            });
    });

    test.test('should return transformed source when filter test succeeds', (test) => {
        let file = resolvePath('test/fixtures/transformed/index.js');
        let data: string;

        let options: Options = {
            loaders: [
                {
                    filter: /(.*)\/*.js/,
                    worker: function (module, content, done) {
                        content = Buffer.from('let bar = \'bar\';\n' + content);

                        done(content);
                    }
                }
            ]
        };

        const transformStream = new TransformStream({
            transform(chunk, encoding, callback) {
                data = chunk.toString();

                callback();
            }
        });

        createReadStream(file)
            .pipe(transform(file, options))
            .pipe(transformStream)
            .on('finish', function () {
                test.same(data, `let bar = 'bar';
let foo = 'foo';
`);

                test.end();
            })
            .on('error', function (error) {
                test.fail(error.message);

                test.end();
            });
    });
});