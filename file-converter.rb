require 'pandoc-ruby'
require 'word-to-markdown'

CIP = %w[Ambition EDT Teach-First UCL]

def convert_to_markdown(tool)

  CIP.each do |programme_name|
    Dir.mkdir("./mentormats/#{tool}-saved-md/#{programme_name}")
    Dir.foreach("./mentormats/#{programme_name}/") do |folder_name|
      next if folder_name.start_with? "."
      Dir.foreach("./mentormats/#{programme_name}/#{folder_name}") do |file_name|
        next if file_name.start_with? "." or file_name.start_with? ".."
        if tool == "pandoc"
        converted_file = PandocRuby.new(["./mentormats/#{programme_name}/#{folder_name}/#{file_name}"], from: :docx, to: :markdown)
        elsif tool == "w2m"
        converted_file = WordToMarkdown.new("./mentormats/#{programme_name}/#{folder_name}/#{file_name}")
        end
        Dir.mkdir("./mentormats/#{tool}-saved-md/#{programme_name}/#{folder_name}") unless Dir.exist?("./mentormats/#{tool}-saved-md/#{programme_name}/#{folder_name}")
        File.write("./mentormats/#{tool}-saved-md/#{programme_name}/#{folder_name}/#{file_name.delete_suffix(".docx")}.md", converted_file)
      end
    end
  end
end


convert_to_markdown(ARGV[0])
