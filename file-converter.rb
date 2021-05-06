require 'pandoc-ruby'
require 'word-to-markdown'

CIP = %w[Ambition-Institute Education-Development-Trust Teach-First UCL]

def convert_to_markdown(tool)

  CIP.each do |programme_name|
    Dir.mkdir("./converted-files/#{tool}-saved-md/#{programme_name}")
    Dir.foreach("./#{programme_name}/") do |folder_name|
      next if folder_name.start_with? "."
      Dir.foreach("./#{programme_name}/#{folder_name}") do |file_name|
        next if file_name.start_with? "." or file_name.start_with? ".."
        converted_file = convert_file(tool, programme_name, folder_name, file_name)
        create_file_path_for_converted_doc(tool, programme_name, folder_name)
        write_file(tool, programme_name, folder_name, file_name, converted_file)
      end
    end
  end
end

def create_file_path_for_converted_doc(tool, programme, folder)
  Dir.mkdir("./converted-files/#{tool}-saved-md/#{programme}/#{folder}") unless Dir.exist?("./converted-files/#{tool}-saved-md/#{programme}/#{folder}")
end

def write_file(tool, programme, folder, file, converted_file)
  File.write("./converted-files/#{tool}-saved-md/#{programme}/#{folder}/#{file.delete_suffix(".docx")}.md", converted_file)
end

def convert_file(tool, programme, folder, file)
  if tool == "pandoc"
    PandocRuby.new(["./#{programme}/#{folder}/#{file}"], from: :docx, to: :markdown)
  elsif tool == "w2m"
    WordToMarkdown.new("./#{programme}/#{folder}/#{file}")
  end
end


convert_to_markdown(ARGV[0])
