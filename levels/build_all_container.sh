#!/bin/bash
array=(`find . -name Dockerfile`)
for i in "${array[@]}"
do
  level=${i#*/}
  level=${level%/*}
  docker build -f $i -t "sclyther/ilias_$level" .
done