#!/bin/sh
#
# Automatically add branch name and branch description to every commit message except merge commit.
#

COMMIT_EDITMSG=$1

commit_emoji() {
  h=$(date +%H)

  if ((h < 5)); then
    echo ":sleeping:"
  elif ((h < 11)); then
    echo ":coffee:"
  elif ((h < 15)); then
    echo ":surfer:"
  elif ((h < 21)); then
    echo ":tada:"
  else
    echo ":new_moon_with_face:"
  fi
}

addBranchName() {
  NAME=$(git branch | grep '*' | sed 's/* //')
  DESCRIPTION=$(git config branch."$NAME".description)
  echo ":tada: [$NAME]: $(cat $COMMIT_EDITMSG)" > $COMMIT_EDITMSG
  if [ -n "$DESCRIPTION" ]
  then
     echo "" >> $COMMIT_EDITMSG
     echo $DESCRIPTION >> $COMMIT_EDITMSG
  fi
}

MERGE=$(cat $COMMIT_EDITMSG|grep -i 'merge'|wc -l)

if [ $MERGE -eq 0 ] ; then
  addBranchName
fi
