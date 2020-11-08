import {Transform as TransformStream} from "stream";

type Worker = (module: string, content: Buffer, done: (content: Buffer) => void) => void;

type Loader = {
    filter: RegExp,
    worker: Worker
};

export type Options = {
    global?: boolean,
    loaders: Array<Loader>
};

export default (file: string, options: Options) => {
    let content = Buffer.from('');

    return new TransformStream({
        transform(chunk, enc, callback) {
            content = Buffer.concat([
                content,
                chunk
            ]);

            callback();
        },
        flush(callback) {
            let loaders = options.loaders;
            let workers: Array<Worker> = [];

            let done = (data: Buffer) => {
                this.push(data);

                callback();
            }

            for (let {filter, worker} of loaders) {
                if (filter.test(file)) {
                    workers.push(worker);
                }
            }

            if (workers.length > 0) {
                for (let worker of workers) {
                    worker(file, content, done);
                }

            } else {
                done(content);
            }
        }
    });
};