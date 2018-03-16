git_prompt_info() {
  current_branch=$(git current-branch 2> /dev/null)
  if [[ -n $current_branch ]]; then
    echo " %{$fg_bold[blue]%}$current_branch%{$reset_color%}"
  fi
}

emoji_prompt() {
  echo "%{$fg_bold[red]%}✈ %{$reset_color%}"
}

setopt promptsubst

# Allow exported PS1 variable to override default prompt.
if ! env | grep -q '^PS1='; then
  PS1='${SSH_CONNECTION+"%{$fg_bold[blue]%}%n@%m:"}%{$fg_bold[yellow]%}%c%{$reset_color%}$(git_prompt_info) $(emoji_prompt)'
fi
