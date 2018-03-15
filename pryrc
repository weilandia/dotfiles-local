Pry.config.editor = "atom"

Pry.config.sub_prompt_name = "⚡︎"

Pry.prompt = [
  proc { |target_self, nest_level, pry|
    "#{pry.input_array.size} > "
  }
 ]


Pry.config.theme = "shibumi"
