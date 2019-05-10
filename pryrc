Pry.config.editor = "vim"

Pry.prompt = [
  proc { |target_self, nest_level, pry|
    "\e[31m#{pry.input_ring.size}\e[0m\e[33m > \e[0m "
  }
 ]

Pry.config.theme = "shibumi"
