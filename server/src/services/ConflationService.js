const EventEmitter = require('events');
const { fork } = require('child_process');

const { v4: uuidv4 } = require('uuid');

const { GTFS_CONFLATION_MAIN } = process.env;

class MatchesEmitter extends EventEmitter {}

let runMatch;

if (GTFS_CONFLATION_MAIN) {
  // https://nodejs.org/api/events.html#events_events
  const matchesEmiter = new MatchesEmitter();

  // https://nodejs.org/api/child_process.html#child_process_subprocess_send_message_sendhandle_options_callback
  const matcher = fork(GTFS_CONFLATION_MAIN);

  console.log(matcher.pid);

  matcher.on('message', ({ id, error, matches }) => {
    matchesEmiter.emit(id, { error, matches });
  });

  runMatch = (features, flags) => {
    const id = uuidv4();

    matcher.send({ id, features, flags });

    return new Promise((resolve, reject) =>
      matchesEmiter.once(id, ({ error, matches }) => {
        console.log(id);
        if (error) {
          return reject(error);
        }

        return resolve(matches);
      }),
    );
  };
} else {
  runMatch = () => {
    throw new Error(
      'GTFS_CONFLATION_MAIN env variable not provided at server start',
    );
  };
}

module.exports = {
  runMatch,
};
