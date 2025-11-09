#!/bin/sh
if [ -z "$husky_skip_init" ]; then
  debug () {
    [ "$HUSKY_DEBUG" = "1" ] && echo "$1"
  }

  readonly hook_name="$(basename "$0")"
  debug "husky:debug $hook_name hook started"

  readonly husky_skip_init=1
  export husky_skip_init
  sh -e "$0" "$@"
  exitCode="$?"

  if [ $exitCode != 0 ]; then
    debug "husky:debug $hook_name hook exited with code $exitCode (error)"
  fi

  exit $exitCode
fi

