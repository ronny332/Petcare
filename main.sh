#!/bin/bash
CWD=`dirname $0`
SLEEP=30
echo "waiting ${SLEEP}s for first connection to FHEM"
sleep $SLEEP
cd "${CWD}/server/dist"
node index.js
