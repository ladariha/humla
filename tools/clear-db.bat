
echo off

rem This should work on win and maybe even on linux
echo Cleaning db data


mongo --eval "db.lectures.remove();" humla
mongo --eval "db.courses.remove();" humla
