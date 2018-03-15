Pry.config.editor = "atom"

Pry.config.prompt_name = "🔨 "
Pry.config.sub_prompt_name = "\001\e[1;33m⚡︎\002\001\e[1;31m⚡︎\002"

Pry.prompt = [
  proc { |target_self, nest_level, pry|
    "\001\e[0;32m#{pry.input_array.size}\002 #{pry.config.prompt_name}\001\e[0m\002 #{Pry.view_clip(target_self)}#{":#{nest_level}" unless nest_level.zero?}\001\e[1;31m\002> \001\e[0m\002"
  },

  proc { |target_self, nest_level, pry|
    "\001\e[1;31m#{pry.input_array.size}\002\001\e[0m\002 #{pry.config.sub_prompt_name}\001\e[0m\002 #{Pry.view_clip(target_self)}#{":#{nest_level}" unless nest_level.zero?}\001\e[1;33m* \002\001\e[0;m\002"
  }
 ]


Pry.config.theme = "shibumi"
