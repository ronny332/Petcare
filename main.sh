#!/bin/bash
CWD=`dirname $0`
SLEEP=1
echo "waiting ${SLEEP}s for first connection to FHEM"
sleep $SLEEP
cd "${CWD}/"
DEBUG=petcare:* npm start > /opt/fhem/log/Petcare.log 2>&1
