# Conflation QA REST Server

Start the server with the path to the condlation SQLite databases as the single
CLI argument.

```bash
./server/index.js ~/AVAIL/gtfs-conflation-pipeline/output_new/cdta/sqlite
```

To enable the __/shst-match__ route

```
GTFS_CONFLATION_MAIN=~/AVAIL/gtfs-conflation-pipeline/src/services/Conflation/main.js server/index.js ~/AVAIL/gtfs-conflation-pipeline/output/cdta/sqlite
```
